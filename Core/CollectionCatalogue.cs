using KolibSoft.Catalogue.Core.Abstractions;
using KolibSoft.Catalogue.Core.Utils;

namespace KolibSoft.Catalogue.Core;

public class CollectionCatalogue<TItem, TFilters> : ICatalogueConnector<TItem, TFilters>
    where TItem : IItem, IValidatable, IUpdatable<TItem>
    where TFilters : IPageFilters, IItemFilters
{

    public ICollection<TItem> Collection { get; }
    public ICollection<string> Errors { get; } = new List<string>();
    public virtual bool Available => true;

    protected virtual IQueryable<TItem> QueryItems(IQueryable<TItem> items, TFilters? filters = default) => items;
    protected virtual bool ValidateInsert(TItem item) => true;
    protected virtual bool ValidateUpdate(TItem item) => true;
    protected virtual bool ValidateDelete(TItem item) => true;

    public virtual Task<Result<Page<TItem>?>> PageAsync(TFilters? filters = default) => Task.Run<Result<Page<TItem>?>>(() =>
    {
        Errors.Clear();
        var items = Collection.AsQueryable();
        if (filters?.UpdatesAt != null) items = items.Where(x => x.UpdatedAt >= filters.UpdatesAt);
        if (filters?.Ids?.Any() == true) items = items.Where(x => filters.Ids.Contains(x.Id));
        items = QueryItems(items, filters);
        var page = items.GetPage(filters?.PageIndex ?? 0, filters?.PageSize ?? CatalogueStatics.DefaultChunkSize);
        return page;
    });

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

    public virtual Task<Result<Guid?>> InsertAsync(TItem item) => Task.Run<Result<Guid?>>(() =>
    {
        Errors.Clear();
        if (!item.Validate(Errors)) return Errors.ToArray();
        if (Collection.Any(x => x.Id == item.Id))
        {
            Errors.Add(CatalogueStatics.RepeatedItem);
            return Errors.ToArray();
        }
        if (!ValidateInsert(item)) return Errors.ToArray();
        Collection.Add(item);
        return item.Id;
    });

    public virtual Task<Result<bool?>> UpdateAsync(Guid id, TItem item) => Task.Run<Result<bool?>>(() =>
    {
        Errors.Clear();
        if (!item.Validate(Errors)) return Errors.ToArray();
        var original = Collection.FirstOrDefault(x => x.Id == id);
        if (original == null)
        {
            Errors.Add(CatalogueStatics.NoItem);
            return Errors.ToArray();
        }
        if (item.UpdatedAt < original.UpdatedAt) return false;
        if (!ValidateUpdate(item)) return Errors.ToArray();
        original.Update(item);
        return true;
    });

    public virtual Task<Result<bool?>> DeleteAsync(Guid id) => Task.Run<Result<bool?>>(() =>
    {
        Errors.Clear();
        var item = Collection.FirstOrDefault(x => x.Id == id);
        if (item == null)
        {
            Errors.Add(CatalogueStatics.NoItem);
            return Errors.ToArray();
        }
        if (!ValidateDelete(item)) return Errors.ToArray();
        Collection.Remove(item);
        return true;
    });

    public CollectionCatalogue(ICollection<TItem> collection)
    {
        Collection = collection;
    }

}