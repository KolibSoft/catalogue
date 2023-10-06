using KolibSoft.Catalogue.Core;
using KolibSoft.Catalogue.Core.Abstractions;
using Microsoft.EntityFrameworkCore;
using static KolibSoft.Catalogue.Core.Constants;

namespace KolibSoft.Catalogue.Client.Example;

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
        if (invalid = Id == Guid.Empty) errors?.Add(InvalidId);
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

public class SettingsService : CatalogueService<SettingsModel, object>
{
    public SettingsService(HttpClient httpClient, string uri) : base(httpClient, uri) { }
}

public class SettingsContext : DbContext
{

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.UseSqlite("Data Source=settings.db");
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<SettingsModel>(entity =>
        {
            entity.ToTable("settings");
            entity.Property(x => x.Id);
            entity.Property(x => x.Value);
            entity.Property(x => x.Active);
            entity.Property(x => x.ModifiedAt);
            entity.HasKey(x => x.Id);
        });
    }

    public SettingsContext() : base()
    {
        Database.EnsureCreated();
    }

    public SettingsContext(DbContextOptions options) : base(options)
    {
        Database.EnsureCreated();
    }

}