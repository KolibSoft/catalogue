using KolibSoft.Catalogue.Core.Abstractions;
using static KolibSoft.Catalogue.Core.Constants;

namespace KolibSoft.Catalogue.Core;

public class Item : IItem, IValidatable, IUpdatable<Item>
{

    public Guid Id { get; set; } = default;
    public DateTime ModifiedAt { get; set; } = default;

    public virtual bool Validate(ICollection<string>? errors = default)
    {
        var valid = true;
        if (Id == Guid.Empty)
        {
            errors?.Add(InvalidId);
            valid = false;
        }
        if (ModifiedAt > DateTime.UtcNow)
        {
            errors?.Add(InvalidModification);
            valid = false;
        }
        return valid;
    }

    public void Update(Item newState)
    {
        if (Id == Guid.Empty) Id = newState.Id;
        ModifiedAt = newState.ModifiedAt;
    }

}