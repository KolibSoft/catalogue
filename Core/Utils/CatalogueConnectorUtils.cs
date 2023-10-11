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
            else return await catalogueConnector.InsertAsync(item);
        }
        else
        {
            if (item == null) return await catalogueConnector.DeleteAsync(id);
            else if (item.ModifiedAt < original.ModifiedAt) return original;
            else return await catalogueConnector.UpdateAsync(id, item);
        }
    }

}