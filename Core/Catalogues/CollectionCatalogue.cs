using KolibSoft.Catalogue.Core.Abstractions;
using KolibSoft.Catalogue.Core.Utils;
using static KolibSoft.Catalogue.Core.Constants;

namespace KolibSoft.Catalogue.Core.Catalogues;

public class CollectionCatalogue<TItem, TFilters> : ICatalogueConnector<TItem, TFilters>
    where TItem : class, IItem, IValidatable, IUpdatable<TItem>
{

    public ICollection<TItem> Collection { get; } = new List<TItem>();
    public ICollection<string> Errors { get; } = new List<string>();
    public virtual bool Available => true;

    protected virtual Task<IEnumerable<TItem>> OnQueryAsync(TFilters? filters) => Task.FromResult<IEnumerable<TItem>>(Collection);
    protected virtual Task<TItem?> OnGetAsync(Guid id) => Task.Run(() => Collection.FirstOrDefault(x => x.Id == id));
    protected virtual Task<bool> OnValidateInsertAsync(TItem item) => Task.FromResult(true);
    protected virtual Task<bool> OnValidateUpdateAsync(TItem item) => Task.FromResult(true);
    protected virtual Task<bool> OnValidateDeleteAsync(TItem item) => Task.FromResult(true);

    public virtual async Task<Result<Page<TItem>?>> QueryAsync(TFilters? filters = default, int pageIndex = 0, int pageSize = DefaultChunkSize)
    {
        Errors.Clear();
        var items = await OnQueryAsync(filters);
        var page = items.GetPage(pageIndex, pageSize);
        return page;
    }

    public virtual async Task<Result<TItem?>> GetAsync(Guid id)
    {
        Errors.Clear();
        var item = await OnGetAsync(id);
        return item;
    }

    public virtual async Task<Result<TItem?>> InsertAsync(TItem item)
    {
        Errors.Clear();
        if (!item.Validate(Errors)) return Errors.ToArray();
        var original = Collection.FirstOrDefault(x => x.Id == item.Id);
        if (original != null) return default(TItem?);
        if (!await OnValidateInsertAsync(item)) return Errors.ToArray();
        Collection.Add(item);
        return item;
    }

    public virtual async Task<Result<TItem?>> UpdateAsync(Guid id, TItem item)
    {
        Errors.Clear();
        if (!item.Validate(Errors)) return Errors.ToArray();
        var original = Collection.FirstOrDefault(x => x.Id == id);
        if (original == null) return default(TItem?);
        if (!await OnValidateUpdateAsync(item)) return Errors.ToArray();
        if (item.ModifiedAt >= original.ModifiedAt) original.Update(item);
        return original;
    }

    public virtual async Task<Result<TItem?>> DeleteAsync(Guid id)
    {
        Errors.Clear();
        var item = Collection.FirstOrDefault(x => x.Id == id);
        if (item == null) return default(TItem?);
        if (!await OnValidateDeleteAsync(item)) return Errors.ToArray();
        Collection.Remove(item);
        return item;
    }

    public CollectionCatalogue(ICollection<TItem>? collection = default)
    {
        Collection = collection ?? new List<TItem>();
    }

}