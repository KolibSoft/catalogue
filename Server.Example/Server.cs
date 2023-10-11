using KolibSoft.Catalogue.Core;
using KolibSoft.Catalogue.Core.Abstractions;
using KolibSoft.Catalogue.Core.Catalogues;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;

namespace KolibSoft.Catalogue.Server.Example;

public class SettingsModel : Item, IValidatable, IUpdatable<SettingsModel>
{

    public string Value { get; set; } = string.Empty;
    public bool Active { get; set; } = true;

    public override bool Validate(ICollection<string>? errors = default)
    {
        var valid = base.Validate(errors);
        if (string.IsNullOrWhiteSpace(Value))
        {
            errors?.Add("EMPTY_VALUE");
            valid = false;
        }
        return valid;
    }

    public void Update(SettingsModel newState)
    {
        Value = newState.Value;
        Active = newState.Active;
        ModifiedAt = DateTime.UtcNow;
    }

}

[Route("[controller]")]
[EnableCors("Allow-All")]
public class SettingsController : CatalogueController<SettingsModel, object>
{
    public static ICollection<SettingsModel> Collection { get; } = new List<SettingsModel>();
    public SettingsController() : base(new CollectionCatalogue<SettingsModel, object>(Collection)) { }
}