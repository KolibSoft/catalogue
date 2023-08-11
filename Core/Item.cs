using KolibSoft.Catalogue.Core.Abstractions;

namespace KolibSoft.Catalogue.Core;

public class Item : IItem
{
    public Guid Id { get; set; }
    public DateTime UpdatedAt { get; set; }
}