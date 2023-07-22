namespace KolibSoft.Catalogue.Core.Abstractions;

public interface IPageFilters
{
    public int? PageIndex { get; }
    public int? PageSize { get; }
}