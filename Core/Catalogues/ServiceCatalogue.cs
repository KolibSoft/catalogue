using KolibSoft.Catalogue.Core.Abstractions;
using KolibSoft.Catalogue.Core.Utils;

namespace KolibSoft.Catalogue.Core.Catalogues;

public class ServiceCatalogue<TItem, TFilters> : ICatalogueConnector<TItem, TFilters>
    where TItem : IItem
{

    public ICatalogueConnector<TItem, TFilters> LocalConnector { get; }
    public ICatalogueConnector<TItem, TFilters> RemoteConnector { get; }
    public virtual bool Available => RemoteConnector.Available || LocalConnector.Available;

    public IDictionary<Guid, string[]?> Changes { get; }

    public virtual async Task Sync()
    {
        if (RemoteConnector.Available)
            try
            {
                await LocalConnector.PushItems(RemoteConnector, Changes);
            }
            catch { }
    }

    public virtual async Task<Result<Page<TItem>?>> PageAsync(TFilters? filters = default)
    {
        if (RemoteConnector.Available)
            try
            {
                var result = await RemoteConnector.PageAsync(filters);
                if (result.Data?.Items.Any() == true) foreach (var item in result.Data.Items) await LocalConnector.SyncItem(item.Id, item);
                return result;
            }
            catch { }
        return await LocalConnector.PageAsync(filters);
    }

    public virtual async Task<Result<TItem?>> GetAsync(Guid id)
    {
        if (RemoteConnector.Available)
            try
            {
                var result = await RemoteConnector.GetAsync(id);
                if (result.Errors == null) await LocalConnector.SyncItem(id, result.Data);
                return result;
            }
            catch { }
        return await LocalConnector.GetAsync(id);
    }

    public virtual async Task<Result<Guid?>> InsertAsync(TItem item)
    {
        Result<Guid?> result;
        if (RemoteConnector.Available)
            try
            {
                result = await RemoteConnector.InsertAsync(item);
                if (result.Data != null) await GetAsync(result.Data.Value);
                return result;
            }
            catch { }
        result = await LocalConnector.InsertAsync(item);
        if (result.Data != null) Changes[result.Data.Value] = null;
        return result;
    }

    public virtual async Task<Result<bool?>> UpdateAsync(Guid id, TItem item)
    {
        Result<bool?> result;
        if (RemoteConnector.Available)
            try
            {
                result = await RemoteConnector.UpdateAsync(id, item);
                if (result.Data == true) await GetAsync(id);
                return result;
            }
            catch { }
        result = await LocalConnector.UpdateAsync(id, item);
        if (result.Data == true) Changes[id] = null;
        return result;
    }

    public virtual async Task<Result<bool?>> DeleteAsync(Guid id)
    {
        Result<bool?> result;
        if (RemoteConnector.Available)
            try
            {
                result = await RemoteConnector.DeleteAsync(id);
                if (result.Data == true) await GetAsync(id);
                return result;
            }
            catch { }
        result = await LocalConnector.DeleteAsync(id);
        if (result.Data == true) Changes[id] = null;
        return result;
    }

    public ServiceCatalogue(ICatalogueConnector<TItem, TFilters> localConnector, ICatalogueConnector<TItem, TFilters> remoteConnector, IDictionary<Guid, string[]?> changes)
    {
        LocalConnector = localConnector;
        RemoteConnector = remoteConnector;
        Changes = changes;
    }

}