import { AppError } from '../../errors/AppError.js';
import { toDateOnly } from '../../utils/date.js';
import { isOverdue } from '../loans/loans.rules.js';
import type { ItemsRepository } from './items.repository.js';
import type { CreateItemInput, ListItemsQuery, UpdateItemInput } from './items.schemas.js';
import type { Item, ItemRecord } from './items.types.js';

const byUkrainianName = (a: string, b: string) => a.localeCompare(b, 'uk');

function toItem(record: ItemRecord, today: string): Item {
  const currentLoan = record.currentLoan && {
    ...record.currentLoan,
    isOverdue: isOverdue({ dueDate: record.currentLoan.dueDate, returnedAt: null }, today),
  };

  return {
    ...record,
    state: currentLoan ? 'on_loan' : record.status,
    currentLoan,
  };
}

function matchesSearch(item: Item, search: string): boolean {
  const needle = search.toLocaleLowerCase();
  return [item.name, item.category, item.inventoryNumber ?? ''].some((field) =>
    field.toLocaleLowerCase().includes(needle),
  );
}

export function createItemsService(
  repository: ItemsRepository,
  today: () => string = () => toDateOnly(new Date()),
) {
  function getOrThrow(id: number): Item {
    const record = repository.findById(id);
    if (!record) {
      throw new AppError(404, 'ITEM_NOT_FOUND', `Item ${id} not found`);
    }
    return toItem(record, today());
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
      const currentDate = today();
      return repository
        .findAll()
        .map((record) => toItem(record, currentDate))
        .filter((item) => !query.q || matchesSearch(item, query.q))
        .filter((item) => !query.category || item.category === query.category)
        .filter((item) => !query.state || item.state === query.state)
        .sort((a, b) => byUkrainianName(a.name, b.name));
    },

    getById: getOrThrow,

    listCategories(): string[] {
      return repository.findCategories().sort(byUkrainianName);
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
