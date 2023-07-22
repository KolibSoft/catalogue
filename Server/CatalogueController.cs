using KolibSoft.Catalogue.Core;
using KolibSoft.Catalogue.Core.Abstractions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace KolibSoft.Catalogue.Server;

public class CatalogueController<TItem, TFilters> : ControllerBase, ICatalogueConnector<TItem, TFilters>
{

    public ICatalogueConnector<TItem, TFilters> CatalogueConnector { get; }

    public virtual bool Available => CatalogueConnector.Available;

    [HttpGet]
    public virtual async Task<Result<Page<TItem>?>> PageAsync([FromQuery] TFilters? filters = default)
    {
        var result = await CatalogueConnector.PageAsync(filters);
        Response.StatusCode = result.Errors?.Any() == true ? StatusCodes.Status400BadRequest : StatusCodes.Status200OK;
        return result;
    }

    [HttpGet("{id}")]
    public virtual async Task<Result<TItem?>> GetAsync([FromRoute] Guid id)
    {
        var result = await CatalogueConnector.GetAsync(id);
        Response.StatusCode = result.Errors?.Any() == true ? StatusCodes.Status400BadRequest : StatusCodes.Status200OK;
        return result;
    }

    [HttpPost]
    public virtual async Task<Result<Guid?>> InsertAsync([FromBody] TItem item)
    {
        var result = await CatalogueConnector.InsertAsync(item);
        Response.StatusCode = result.Errors?.Any() == true ? StatusCodes.Status400BadRequest : StatusCodes.Status200OK;
        return result;
    }

    [HttpPut("{id}")]
    public virtual async Task<Result<bool?>> UpdateAsync([FromRoute] Guid id, [FromBody] TItem item)
    {
        var result = await CatalogueConnector.UpdateAsync(id, item);
        Response.StatusCode = result.Errors?.Any() == true ? StatusCodes.Status400BadRequest : StatusCodes.Status200OK;
        return result;
    }

    [HttpDelete("{id}")]
    public virtual async Task<Result<bool?>> DeleteAsync([FromRoute] Guid id)
    {
        var result = await CatalogueConnector.DeleteAsync(id);
        Response.StatusCode = result.Errors?.Any() == true ? StatusCodes.Status400BadRequest : StatusCodes.Status200OK;
        return result;
    }

    public CatalogueController(ICatalogueConnector<TItem, TFilters> catalogueConnector)
    {
        CatalogueConnector = catalogueConnector;
    }

}