using KolibSoft.Catalogue.Core.Abstractions;

namespace KolibSoft.Catalogue.Core.Utils;

public static class CatalogueConnectorUtils
{

    public static async Task<string[]?> SyncItem<TItem, TFilters>(this ICatalogueConnector<TItem, TFilters> catalogueConnector, Guid id, TItem? item)
        where TItem : IItem
    {
        var original = (await catalogueConnector.GetAsync(id)).Data;
        if (original == null)
        {
            if (item == null) return null;
            else return (await catalogueConnector.InsertAsync(item)).Errors;
        }
        else
        {
            if (item == null) return (await catalogueConnector.DeleteAsync(id)).Errors;
            else if (item.UpdatedAt < original.UpdatedAt) return null;
            else return (await catalogueConnector.UpdateAsync(id, item)).Errors;
        }
    }

    public static async Task PullItems<TItem, TFilters>(this ICatalogueConnector<TItem, TFilters> dstConnector, ICatalogueConnector<TItem, TFilters> srcConnector, IDictionary<Guid, string[]?> changes)
        where TItem : IItem
    {
        foreach (var id in changes.Keys.ToArray())
        {
            var item = (await srcConnector.GetAsync(id)).Data;
            var errors = await dstConnector.SyncItem(id, item);
            if (errors == null) changes.Remove(id);
            else changes[id] = errors;
        }
    }

    public static async Task PushItems<TItem, TFilters>(this ICatalogueConnector<TItem, TFilters> srcConnector, ICatalogueConnector<TItem, TFilters> dstConnector, IDictionary<Guid, string[]?> changes)
        where TItem : IItem
    {
        foreach (var id in changes.Keys.ToArray())
        {
            var item = (await srcConnector.GetAsync(id)).Data;
            var errors = await dstConnector.SyncItem(id, item);
            if (errors == null) changes.Remove(id);
            else changes[id] = errors;
        }
    }

}