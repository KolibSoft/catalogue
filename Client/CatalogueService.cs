using System.Net.Http.Json;
using System.Net.NetworkInformation;
using KolibSoft.Catalogue.Client.Utils;
using KolibSoft.Catalogue.Core;
using KolibSoft.Catalogue.Core.Abstractions;
using static KolibSoft.Catalogue.Core.Constants;

namespace KolibSoft.Catalogue.Client;

public class CatalogueService<TItem, TFilters> : ICatalogueConnector<TItem, TFilters>
{

    public HttpClient HttpClient { get; }
    public string Uri { get; }
    public virtual bool Available => NetworkInterface.GetAllNetworkInterfaces().Any(x => x.OperationalStatus == OperationalStatus.Up && x.NetworkInterfaceType != NetworkInterfaceType.Loopback);

    public virtual async Task<Result<Page<TItem>?>> QueryAsync(TFilters? filters = default, int pageIndex = 0, int pageSize = DefaultChunkSize)
    {
        var uri = $"{Uri}{QueryStringSerializer.Serialize(filters)}&pageIndex={pageIndex}&pageSize={pageSize}";
        var response = await HttpClient.GetAsync(uri);
        var result = await response.HandleResult<Page<TItem>?>();
        return result;
    }

    public virtual async Task<Result<TItem?>> GetAsync(Guid id)
    {
        var uri = $"{Uri}/{id}";
        var response = await HttpClient.GetAsync(uri);
        var result = await response.HandleResult<TItem?>();
        return result;
    }

    public virtual async Task<Result<TItem?>> InsertAsync(TItem item)
    {
        var uri = $"{Uri}";
        var response = await HttpClient.PostAsJsonAsync(uri, item);
        var result = await response.HandleResult<TItem?>();
        return result;
    }

    public virtual async Task<Result<TItem?>> UpdateAsync(Guid id, TItem item)
    {
        var uri = $"{Uri}/{id}";
        var response = await HttpClient.PutAsJsonAsync(uri, item);
        var result = await response.HandleResult<TItem?>();
        return result;
    }

    public virtual async Task<Result<TItem?>> DeleteAsync(Guid id)
    {
        var uri = $"{Uri}/{id}";
        var response = await HttpClient.DeleteAsync(uri);
        var result = await response.HandleResult<TItem?>();
        return result;
    }

    public CatalogueService(HttpClient httpClient, string uri)
    {
        HttpClient = httpClient;
        Uri = uri;
    }

}