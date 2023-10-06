namespace KolibSoft.Catalogue.Core.Abstractions;

public interface IItem
{
    public Guid Id { get; }
    public DateTime ModifiedAt { get; }
}