using System.Net;
using KolibSoft.Catalogue.Core;
using KolibSoft.Catalogue.Core.Abstractions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using static KolibSoft.Catalogue.Core.Constants;

namespace KolibSoft.Catalogue.Server;

[Route("_NO_ROUTE_")]
public class CatalogueController<TItem, TFilters> : ControllerBase, ICatalogueConnector<TItem, TFilters>
{

    public ICatalogueConnector<TItem, TFilters> CatalogueConnector { get; }

    public virtual bool Available => CatalogueConnector.Available;

    [HttpGet]
    public virtual async Task<Result<Page<TItem>?>> QueryAsync([FromQuery] TFilters? filters = default, int pageIndex = 0, int pageSize = DefaultChunkSize)
    {
        var result = await CatalogueConnector.QueryAsync(filters, pageIndex, pageSize);
        Response.StatusCode =
            result.Errors.Length > 0
            ? (int)HttpStatusCode.BadRequest
            : result.Data == null
            ? (int)HttpStatusCode.NotFound
            : (int)HttpStatusCode.OK
            ;
        return result;
    }

    [HttpGet("{id}")]
    public virtual async Task<Result<TItem?>> GetAsync([FromRoute] Guid id)
    {
        var result = await CatalogueConnector.GetAsync(id);
        Response.StatusCode =
            result.Errors.Length > 0
            ? (int)HttpStatusCode.BadRequest
            : result.Data == null
            ? (int)HttpStatusCode.NotFound
            : (int)HttpStatusCode.OK
            ;
        return result;
    }

    [HttpPost]
    public virtual async Task<Result<TItem?>> InsertAsync([FromBody] TItem item)
    {
        var result = await CatalogueConnector.InsertAsync(item);
        Response.StatusCode =
            result.Errors.Length > 0
            ? (int)HttpStatusCode.BadRequest
            : result.Data == null
            ? (int)HttpStatusCode.Conflict
            : (int)HttpStatusCode.Created
            ;
        return result;
    }

    [HttpPut("{id}")]
    public virtual async Task<Result<TItem?>> UpdateAsync([FromRoute] Guid id, [FromBody] TItem item)
    {
        var result = await CatalogueConnector.UpdateAsync(id, item);
        Response.StatusCode =
            result.Errors.Length > 0
            ? (int)HttpStatusCode.BadRequest
            : result.Data == null
            ? (int)HttpStatusCode.NotFound
            : (int)HttpStatusCode.OK
            ;
        return result;
    }

    [HttpDelete("{id}")]
    public virtual async Task<Result<TItem?>> DeleteAsync([FromRoute] Guid id)
    {
        var result = await CatalogueConnector.DeleteAsync(id);
        Response.StatusCode =
            result.Errors.Length > 0
            ? (int)HttpStatusCode.BadRequest
            : result.Data == null
            ? (int)HttpStatusCode.NotFound
            : (int)HttpStatusCode.OK
            ;
        return result;
    }

    public CatalogueController(ICatalogueConnector<TItem, TFilters> catalogueConnector)
    {
        CatalogueConnector = catalogueConnector;
    }

}