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

    public static async Task PullItems<TItem, TFilters>(this ICatalogueConnector<TItem, TFilters> dstConnector, ICatalogueConnector<TItem, TFilters> srcConnector, IDictionary<Guid, string[]> changes)
        where TItem : IItem
    {
        foreach (var id in changes.Keys.ToArray())
        {
            var item = (await srcConnector.GetAsync(id)).Data;
            var result = await dstConnector.SyncItem(id, item);
            if (result.Ok) changes.Remove(id);
            else changes[id] = result.Errors;
        }
    }

    public static async Task PushItems<TItem, TFilters>(this ICatalogueConnector<TItem, TFilters> srcConnector, ICatalogueConnector<TItem, TFilters> dstConnector, IDictionary<Guid, string[]> changes)
        where TItem : IItem
    {
        foreach (var id in changes.Keys.ToArray())
        {
            var item = (await srcConnector.GetAsync(id)).Data;
            var result = await dstConnector.SyncItem(id, item);
            if (result.Ok) changes.Remove(id);
            else changes[id] = result.Errors;
        }
    }

}