using KolibSoft.Catalogue.Core.Abstractions;

namespace KolibSoft.Catalogue.Core.Utils;

public static class CatalogueConnectorUtils
{

    public static async Task<Result<TItem?>> SyncItem<TItem, TFilters>(this ICatalogueConnector<TItem, TFilters> catalogueConnector, Guid id, TItem? item)
        where TItem : IItem
    {
        var original = (await catalogueConnector.GetAsync(id)).Data;
        if (original == null)
        {
            if (item == null) return default;
            else return (await catalogueConnector.InsertAsync(item));
        }
        else
        {
            if (item == null) return (await catalogueConnector.DeleteAsync(id));
            else if (item.ModifiedAt < original.ModifiedAt) return default;
            else return (await catalogueConnector.UpdateAsync(id, item));
        }
    }

    public static async Task PullChanges<TItem, TFilters>(this ICatalogueConnector<TItem, TFilters> dstConnector, ICatalogueConnector<TItem, TFilters> srcConnector, ICollection<Change> changes)
        where TItem : IItem
    {
        foreach (var change in changes.ToArray())
        {
            var item = (await srcConnector.GetAsync(change.Id)).Data;
            var result = await dstConnector.SyncItem(change.Id, item);
            if (result.Ok) changes.Remove(change);
            else change.Errors = result.Errors;
        }
    }

    public static async Task PushChanges<TItem, TFilters>(this ICatalogueConnector<TItem, TFilters> srcConnector, ICatalogueConnector<TItem, TFilters> dstConnector, ICollection<Change> changes)
        where TItem : IItem
    {
        foreach (var change in changes.ToArray())
        {
            var item = (await srcConnector.GetAsync(change.Id)).Data;
            var result = await dstConnector.SyncItem(change.Id, item);
            if (result.Ok) changes.Remove(change);
            else change.Errors = result.Errors;
        }
    }

}