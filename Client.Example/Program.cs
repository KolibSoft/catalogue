using System.Text.Json;
using KolibSoft.Catalogue.Client.Example;
using KolibSoft.Catalogue.Core;
using KolibSoft.Catalogue.Core.Abstractions;
using KolibSoft.Catalogue.Core.Utils;

var httpClient = new HttpClient();
// var uri = "https://localhost:7072";
var uri = "http://localhost:5033";
var start = DateTime.UtcNow;

var json = File.Exists("changes.json") ? await File.ReadAllTextAsync("changes.json") : "[]";
var changes = JsonSerializer.Deserialize<IDictionary<Guid, string[]?>>(json)!;

var connector = new ServiceCatalogue<SettingsModel, CatalogueFilters>(
    new DatabaseCatalogue<SettingsModel, CatalogueFilters>(new SettingsContext()),
    new SettingsService(httpClient, $"{uri}/settings"),
    changes
);

await connector.Sync();
await InsertMany();

var page = await connector.PageAsync();

json = JsonSerializer.Serialize(connector.Changes);
await File.WriteAllTextAsync("changes.json", json);

async Task InsertMany()
{
    for (var i = 0; i < 5; i++)
    {
        var idResult = await connector!.InsertAsync(new SettingsModel { Value = $"" });
    }
}