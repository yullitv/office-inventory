import { AppError } from '../../errors/AppError.js';
import type { ItemsRepository } from './items.repository.js';
import type { CreateItemInput, ListItemsQuery, UpdateItemInput } from './items.schemas.js';
import type { Item, ItemState } from './items.types.js';

export function getItemState(item: Item): ItemState {
  if (item.currentLoan) return 'on_loan';
  return item.status;
}

function matchesSearch(item: Item, search: string): boolean {
  const needle = search.toLocaleLowerCase();
  return [item.name, item.category, item.inventoryNumber ?? ''].some((field) =>
    field.toLocaleLowerCase().includes(needle),
  );
}

export function createItemsService(repository: ItemsRepository) {
  function getOrThrow(id: number): Item {
    const item = repository.findById(id);
    if (!item) {
      throw new AppError(404, 'ITEM_NOT_FOUND', `Item ${id} not found`);
    }
    return item;
  }

  function assertInventoryNumberFree(
    inventoryNumber: string | null | undefined,
    exceptId?: number,
  ) {
    if (inventoryNumber && repository.isInventoryNumberTaken(inventoryNumber, exceptId)) {
      throw new AppError(
        409,
        'INVENTORY_NUMBER_TAKEN',
        `Inventory number ${inventoryNumber} is already used`,
      );
    }
  }

  return {
    list(query: ListItemsQuery): Item[] {
      return repository
        .findAll()
        .filter((item) => !query.q || matchesSearch(item, query.q))
        .filter((item) => !query.category || item.category === query.category)
        .filter((item) => !query.state || getItemState(item) === query.state);
    },

    getById: getOrThrow,

    listCategories(): string[] {
      return repository.findCategories();
    },

    create(input: CreateItemInput): Item {
      assertInventoryNumberFree(input.inventoryNumber);
      const id = repository.create(input);
      return getOrThrow(id);
    },

    update(id: number, input: UpdateItemInput): Item {
      const item = getOrThrow(id);

      if (item.currentLoan && input.status && input.status !== 'available') {
        throw new AppError(
          409,
          'ITEM_ON_LOAN',
          'Cannot change status while the item is on loan. Mark it as returned first',
        );
      }
      assertInventoryNumberFree(input.inventoryNumber, id);

      repository.update(id, input);
      return getOrThrow(id);
    },

    remove(id: number): void {
      const item = getOrThrow(id);

      if (item.currentLoan) {
        throw new AppError(
          409,
          'ITEM_ON_LOAN',
          'Cannot delete an item that is on loan. Mark it as returned first',
        );
      }

      repository.archive(id);
    },
  };
}

export type ItemsService = ReturnType<typeof createItemsService>;
