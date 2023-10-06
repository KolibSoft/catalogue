using KolibSoft.Catalogue.Core;
using KolibSoft.Catalogue.Core.Abstractions;
using KolibSoft.Catalogue.Core.Catalogues;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;

namespace KolibSoft.Catalogue.Server.Example;

public class SettingsModel : IItem, IValidatable, IUpdatable<SettingsModel>
{

    public Guid Id { get; set; } = Guid.NewGuid();
    public string Value { get; set; } = string.Empty;
    public bool Active { get; set; } = true;
    public DateTime ModifiedAt { get; set; } = DateTime.UtcNow;

    public bool Validate(ICollection<string>? errors = default)
    {
        Value = Value.Trim();
        var invalid = false;
        if (invalid = Id == Guid.Empty) errors?.Add(Constants.InvalidId);
        if (invalid = Value == string.Empty) errors?.Add("INVALID_VALUE");
        return !invalid;
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
public class SettingsController : CatalogueController<SettingsModel, CatalogueFilters>
{
    public static ICollection<SettingsModel> Collection { get; } = new List<SettingsModel>();
    public SettingsController() : base(new CollectionCatalogue<SettingsModel, CatalogueFilters>(Collection)) { }
}