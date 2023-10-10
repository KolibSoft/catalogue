using KolibSoft.Catalogue.Core.Abstractions;
using KolibSoft.Catalogue.Core.Utils;
using static KolibSoft.Catalogue.Core.Constants;

namespace KolibSoft.Catalogue.Core.Catalogues;

public class ServiceCatalogue<TItem, TFilters> : ICatalogueConnector<TItem, TFilters>
    where TItem : IItem
{

    public ICatalogueConnector<TItem, TFilters> LocalConnector { get; }
    public ICatalogueConnector<TItem, TFilters> RemoteConnector { get; }
    public virtual bool Available => RemoteConnector.Available || LocalConnector.Available;

    public ICollection<Change> Changes { get; }

    public virtual async Task SyncChangesAsync()
    {
        if (RemoteConnector.Available)
            try
            {
                foreach (var change in Changes.ToArray())
                {
                    var get_result = await LocalConnector.GetAsync(change.Id);
                    var sync_result = await RemoteConnector.SyncAsync(change.Id, get_result.Data);
                    if (sync_result.Ok)
                    {
                        await LocalConnector.SyncAsync(change.Id, sync_result.Data);
                        Changes.Remove(change);
                    }
                    else change.Errors = sync_result.Errors;
                }
            }
            catch (Exception e) { Console.WriteLine(e.Message); }
    }

    public virtual async Task<Result<Page<TItem>?>> QueryAsync(TFilters? filters = default, int pageIndex = 0, int pageSize = DefaultChunkSize)
    {
        if (RemoteConnector.Available)
            try
            {
                var result = await RemoteConnector.QueryAsync(filters, pageIndex, pageSize);
                if (result.Data?.Items.Any() == true) foreach (var item in result.Data.Items) await LocalConnector.SyncAsync(item.Id, item);
                return result;
            }
            catch (Exception e) { Console.WriteLine(e.Message); }
        return await LocalConnector.QueryAsync(filters, pageIndex, pageSize);
    }

    public virtual async Task<Result<TItem?>> GetAsync(Guid id)
    {
        if (RemoteConnector.Available)
            try
            {
                var result = await RemoteConnector.GetAsync(id);
                if (result.Ok) await LocalConnector.SyncAsync(id, result.Data);
                return result;
            }
            catch (Exception e) { Console.WriteLine(e.Message); }
        return await LocalConnector.GetAsync(id);
    }

    public virtual async Task<Result<TItem?>> InsertAsync(TItem item)
    {
        Result<TItem?> result;
        if (RemoteConnector.Available)
            try
            {
                result = await RemoteConnector.InsertAsync(item);
                if (result.Ok) await LocalConnector.SyncAsync(item.Id, result.Data);
                return result;
            }
            catch (Exception e) { Console.WriteLine(e.Message); }
        result = await LocalConnector.InsertAsync(item);
        if (result.Ok) Changes.Add(new Change(item.Id));
        return result;
    }

    public virtual async Task<Result<TItem?>> UpdateAsync(Guid id, TItem item)
    {
        Result<TItem?> result;
        if (RemoteConnector.Available)
            try
            {
                result = await RemoteConnector.UpdateAsync(id, item);
                if (result.Ok) await LocalConnector.SyncAsync(id, result.Data);
                return result;
            }
            catch (Exception e) { Console.WriteLine(e.Message); }
        result = await LocalConnector.UpdateAsync(id, item);
        if (result.Ok) Changes.Add(new Change(id));
        return result;
    }

    public virtual async Task<Result<TItem?>> DeleteAsync(Guid id)
    {
        Result<TItem?> result;
        if (RemoteConnector.Available)
            try
            {
                result = await RemoteConnector.DeleteAsync(id);
                if (result.Ok) await LocalConnector.SyncAsync(id, result.Data);
                return result;
            }
            catch (Exception e) { Console.WriteLine(e.Message); }
        result = await LocalConnector.DeleteAsync(id);
        if (result.Ok) Changes.Add(new Change(id));
        return result;
    }

    public virtual Task<Result<TItem?>> SyncAsync(Guid id, TItem? item) => this.SyncItem(id, item);

    public ServiceCatalogue(ICatalogueConnector<TItem, TFilters> localConnector, ICatalogueConnector<TItem, TFilters> remoteConnector, ICollection<Change> changes)
    {
        LocalConnector = localConnector;
        RemoteConnector = remoteConnector;
        Changes = changes;
    }

}