using KolibSoft.Catalogue.Core.Abstractions;
using KolibSoft.Catalogue.Core.Utils;

namespace KolibSoft.Catalogue.Core;

public class CollectionCatalogue<TItem, TFilters> : ICatalogueConnector<TItem, TFilters>
    where TItem : IItem, IUpdatable<TItem>
    where TFilters : IPageFilters, IItemFilters
{

    public ICollection<TItem> Collection { get; }
    public ICollection<string> Errors { get; } = new List<string>();
    public virtual bool Available => true;

    protected virtual Task<IQueryable<TItem>> QueryItems(IQueryable<TItem> items, TFilters? filters = default) => Task.FromResult(items);
    protected virtual Task<bool> ValidateInsert(TItem item) => Task.FromResult(true);
    protected virtual Task<bool> ValidateUpdate(TItem item) => Task.FromResult(true);
    protected virtual Task<bool> ValidateDelete(TItem item) => Task.FromResult(true);

    public virtual async Task<Result<Page<TItem>?>> PageAsync(TFilters? filters = default)
    {
        Errors.Clear();
        var items = Collection.AsQueryable();
        if (filters?.ChangesAt != null) items = items.Where(x => x.UpdatedAt >= filters.ChangesAt);
        if (filters?.Ids?.Any() == true) items = items.Where(x => filters.Ids.Contains(x.Id));
        items = await QueryItems(items, filters);
        var page = items.GetPage(filters?.PageIndex ?? 0, filters?.PageSize ?? CatalogueStatics.DefaultChunkSize);
        return page;
    }

    public virtual Task<Result<TItem?>> GetAsync(Guid id) => Task.Run<Result<TItem?>>(() =>
    {
        Errors.Clear();
        var item = Collection.FirstOrDefault(x => x.Id == id);
        if (item == null)
        {
            Errors.Add(CatalogueStatics.NoItem);
            return Errors.ToArray();
        }
        return item;
    });

    public virtual async Task<Result<Guid?>> InsertAsync(TItem item)
    {
        Errors.Clear();
        if ((item as IValidatable)?.Validate(Errors) == false) return Errors.ToArray();
        if (Collection.Any(x => x.Id == item.Id))
        {
            Errors.Add(CatalogueStatics.RepeatedItem);
            return Errors.ToArray();
        }
        if (!(await ValidateInsert(item))) return Errors.ToArray();
        Collection.Add(item);
        return item.Id;
    }

    public virtual async Task<Result<bool?>> UpdateAsync(Guid id, TItem item)
    {
        Errors.Clear();
        if ((item as IValidatable)?.Validate(Errors) == false) return Errors.ToArray();
        var original = Collection.FirstOrDefault(x => x.Id == id);
        if (original == null)
        {
            Errors.Add(CatalogueStatics.NoItem);
            return Errors.ToArray();
        }
        if (item.UpdatedAt < original.UpdatedAt) return false;
        if (!(await ValidateUpdate(item))) return Errors.ToArray();
        original.Update(item);
        return true;
    }

    public virtual async Task<Result<bool?>> DeleteAsync(Guid id)
    {
        Errors.Clear();
        var item = Collection.FirstOrDefault(x => x.Id == id);
        if (item == null)
        {
            Errors.Add(CatalogueStatics.NoItem);
            return Errors.ToArray();
        }
        if (!(await ValidateDelete(item))) return Errors.ToArray();
        Collection.Remove(item);
        return true;
    }

    public CollectionCatalogue(ICollection<TItem> collection)
    {
        Collection = collection;
    }

}