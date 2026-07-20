import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type {
  Card,
  Deck,
  DeckImportResult,
  DeckPayload,
  DeckValidation,
  DeckValidationError,
} from '@onepiecetcg/shared';
import {
  exportDeckToText,
  normalizeCardId,
  normalizeDeckCards,
  parseDeckText,
} from '@onepiecetcg/shared';
import { Repository } from 'typeorm';
import {
  AccountsService,
  type AuthenticatedUser,
} from '../accounts/accounts.service';
import { CatalogService } from '../catalog/catalog.service';
import { SavedDeck } from './saved-deck.entity';

@Injectable()
export class DecksService {
  constructor(
    @InjectRepository(SavedDeck)
    private readonly decks: Repository<SavedDeck>,
    private readonly accountsService: AccountsService,
    private readonly catalogService: CatalogService,
  ) {}

  async list(user: AuthenticatedUser): Promise<Deck[]> {
    const account = await this.accountsService.findOrCreateForAuthUser(user);
    const decks = await this.decks.find({
      where: { ownerId: account.id },
      order: { updatedAt: 'DESC' },
    });

    return decks.map((deck) => this.toContract(deck));
  }

  async get(user: AuthenticatedUser, id: string): Promise<Deck> {
    const deck = await this.findOwnedDeck(user, id);

    return this.toContract(deck);
  }

  async create(user: AuthenticatedUser, payload: DeckPayload): Promise<Deck> {
    const account = await this.accountsService.findOrCreateForAuthUser(user);
    const normalized = this.normalizePayload(payload);
    const validation = await this.validate(normalized);

    if (!validation.valid) {
      throw new BadRequestException({ message: 'Deck invalide', validation });
    }

    const deck = this.decks.create({
      ownerId: account.id,
      name: this.normalizeName(normalized.name),
      leaderCardId: normalized.leaderCardId,
      cards: normalized.cards,
    });

    return this.toContract(await this.decks.save(deck));
  }

  async update(
    user: AuthenticatedUser,
    id: string,
    payload: DeckPayload,
  ): Promise<Deck> {
    const deck = await this.findOwnedDeck(user, id);
    const normalized = this.normalizePayload(payload);
    const validation = await this.validate(normalized);

    if (!validation.valid) {
      throw new BadRequestException({ message: 'Deck invalide', validation });
    }

    deck.name = this.normalizeName(normalized.name);
    deck.leaderCardId = normalized.leaderCardId;
    deck.cards = normalized.cards;

    return this.toContract(await this.decks.save(deck));
  }

  async remove(
    user: AuthenticatedUser,
    id: string,
  ): Promise<{ deleted: true }> {
    const deck = await this.findOwnedDeck(user, id);
    await this.decks.remove(deck);

    return { deleted: true };
  }

  async importText(text: string, name?: string): Promise<DeckImportResult> {
    const payload = parseDeckText(text, name?.trim() || 'Deck importe');

    return {
      payload,
      validation: await this.validate(payload),
    };
  }

  async validate(payload: DeckPayload): Promise<DeckValidation> {
    const normalized = this.normalizePayload(payload);
    const catalog = await this.catalogService.searchCards({});
    const cardById = new Map(catalog.cards.map((card) => [card.id, card]));
    const errors: DeckValidationError[] = [];
    const leader = normalized.leaderCardId
      ? cardById.get(normalized.leaderCardId)
      : null;

    if (!normalized.leaderCardId) {
      errors.push({
        code: 'MISSING_LEADER',
        message: 'Selectionne exactement 1 Leader.',
      });
    } else if (!leader) {
      errors.push({
        code: 'LEADER_NOT_FOUND',
        message: `Leader ${normalized.leaderCardId} introuvable.`,
        cardId: normalized.leaderCardId,
      });
    } else if (leader.type !== 'Leader') {
      errors.push({
        code: 'LEADER_TYPE',
        message: `${leader.number} n'est pas une carte Leader.`,
        cardId: leader.id,
      });
    }

    const mainDeckCount = normalized.cards.reduce(
      (sum, card) => sum + card.quantity,
      0,
    );

    if (mainDeckCount !== 50) {
      errors.push({
        code: 'MAIN_DECK_SIZE',
        message: `Le deck doit contenir exactement 50 cartes hors Leader (${mainDeckCount} actuellement).`,
      });
    }

    for (const deckCard of normalized.cards) {
      const card = cardById.get(deckCard.cardId);

      if (!card) {
        errors.push({
          code: 'CARD_NOT_FOUND',
          message: `Carte ${deckCard.cardId} introuvable.`,
          cardId: deckCard.cardId,
        });
        continue;
      }

      if (!['Character', 'Event', 'Stage'].includes(card.type)) {
        errors.push({
          code: 'CARD_TYPE',
          message: `${card.number} ne peut pas etre dans le deck principal.`,
          cardId: card.id,
        });
      }

      if (deckCard.quantity > 4) {
        errors.push({
          code: 'CARD_QUANTITY',
          message: `${card.number} depasse la limite de 4 exemplaires.`,
          cardId: card.id,
        });
      }

      if (leader && !this.hasLeaderColor(card, leader)) {
        errors.push({
          code: 'CARD_COLOR',
          message: `${card.number} contient une couleur absente du Leader.`,
          cardId: card.id,
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      leaderCardId: normalized.leaderCardId || null,
      mainDeckCount,
    };
  }

  private async findOwnedDeck(
    user: AuthenticatedUser,
    id: string,
  ): Promise<SavedDeck> {
    const account = await this.accountsService.findOrCreateForAuthUser(user);
    const deck = await this.decks.findOne({ where: { id } });

    if (!deck) {
      throw new NotFoundException('Deck introuvable');
    }

    if (deck.ownerId !== account.id) {
      throw new ForbiddenException('Ce deck appartient a un autre compte');
    }

    return deck;
  }

  private normalizePayload(payload: DeckPayload): DeckPayload {
    return {
      name: this.normalizeName(payload.name),
      leaderCardId: normalizeCardId(payload.leaderCardId),
      cards: normalizeDeckCards(payload.cards),
    };
  }

  private normalizeName(name: string): string {
    return name.trim().slice(0, 80) || 'Nouveau deck';
  }

  private hasLeaderColor(card: Card, leader: Card): boolean {
    if (card.colors.length === 0) {
      return true;
    }

    return card.colors.every((color) => leader.colors.includes(color));
  }

  private toContract(deck: SavedDeck): Deck {
    const payload = {
      name: deck.name,
      leaderCardId: deck.leaderCardId,
      cards: deck.cards,
    };

    return {
      id: deck.id,
      ...payload,
      exportText: exportDeckToText(payload),
      createdAt: deck.createdAt.toISOString(),
      updatedAt: deck.updatedAt.toISOString(),
    };
  }
}
