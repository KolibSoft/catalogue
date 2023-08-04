namespace KolibSoft.Catalogue.Core.Abstractions;

public interface IItemFilters
{
    public Guid[]? Ids { get; }
    public DateTime? ChangesAt { get; }
}