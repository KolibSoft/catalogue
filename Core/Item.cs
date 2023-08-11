using KolibSoft.Catalogue.Core.Abstractions;

namespace KolibSoft.Catalogue.Core;

public class Item : IItem, IValidatable
{

    public Guid Id { get; set; } = Guid.NewGuid();
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public virtual bool Validate(ICollection<string>? errors = default) => true;

}