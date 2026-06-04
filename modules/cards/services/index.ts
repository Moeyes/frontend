import { cardsHttpAdapter } from '../adapters/cardsHttpAdapter';

export const getCard = cardsHttpAdapter.getCard.bind(cardsHttpAdapter);
export const getCards = cardsHttpAdapter.getCards.bind(cardsHttpAdapter);
