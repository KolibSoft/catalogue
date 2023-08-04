using KolibSoft.Catalogue.Core.Abstractions;

namespace KolibSoft.Catalogue.Core;

public class CatalogueFilters : IPageFilters, IItemFilters
{
    public int? PageIndex { get; init; }
    public int? PageSize { get; init; }
    public Guid[]? Ids { get; init; }
    public DateTime? ChangesAt { get; init; }
    public string? Hint { get; init; }
}