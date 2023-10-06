using System.Formats.Asn1;
using KolibSoft.Catalogue.Core;
using KolibSoft.Catalogue.Core.Abstractions;
using KolibSoft.Catalogue.Core.Catalogues;
using KolibSoft.Catalogue.Core.Utils;

namespace Core.Tests;

public class CollectionCatalogueTests
{

    public class TestModel : Item, IUpdatable<TestModel>
    {

        public string Text { get; set; } = string.Empty;

        public override bool Validate(ICollection<string>? errors = null)
        {
            var valid = base.Validate(errors);
            if (string.IsNullOrWhiteSpace(Text))
            {
                errors?.Add("EMPTY_TEXT");
                valid = false;
            }
            return valid;
        }

        public void Update(TestModel newState)
        {
            base.Update(newState);
            Text = newState.Text;
        }

    }

    public CollectionCatalogue<TestModel, object> Catalogue { get; set; } = new();

    [SetUp]
    public void Setup()
    {
        Catalogue = new CollectionCatalogue<TestModel, object>(new List<TestModel> {
            new TestModel {
                Id = Guid.NewGuid(),
                ModifiedAt = DateTime.UtcNow,
                Text = "Anything"
            },
            new TestModel {
                Id = Guid.NewGuid(),
                ModifiedAt = DateTime.UtcNow,
                Text = "Anything"
            },
            new TestModel {
                Id = Guid.NewGuid(),
                ModifiedAt = DateTime.UtcNow,
                Text = "Anything"
            },
            new TestModel {
                Id = Guid.NewGuid(),
                ModifiedAt = DateTime.UtcNow,
                Text = "Anything"
            }
        });
    }

    [Test]
    public async Task Workflow()
    {
        var query = await Catalogue.QueryAsync();
        Assert.AreEqual(query.Data!.Items.Length, Catalogue.Collection.Count);

        var item = new TestModel
        {
            Id = Guid.NewGuid(),
            ModifiedAt = DateTime.UtcNow,
            Text = "Anything"
        };

        var insert = await Catalogue.InsertAsync(item);
        Assert.IsNotNull(insert.Data);
        Assert.IsEmpty(insert.Errors);

        query = await Catalogue.QueryAsync();
        Assert.AreEqual(query.Data!.Items.Length, Catalogue.Collection.Count);

        insert = await Catalogue.InsertAsync(item);
        Assert.IsNull(insert.Data);
        Assert.IsEmpty(insert.Errors);

        item = item.Clone();
        item.Text = "Text Eddited";
        var update = await Catalogue.UpdateAsync(item.Id, item);
        Assert.IsNotNull(update.Data);
        Assert.IsEmpty(update.Errors);

        update = await Catalogue.UpdateAsync(item.Id, item);
        Assert.IsNotNull(update.Data);
        Assert.IsEmpty(update.Errors);

        item = item.Clone();
        var delete = await Catalogue.DeleteAsync(item.Id);
        Assert.IsNotNull(delete.Data);
        Assert.IsEmpty(delete.Errors);

        query = await Catalogue.QueryAsync();
        Assert.AreEqual(query.Data!.Items.Length, Catalogue.Collection.Count);

        delete = await Catalogue.DeleteAsync(item.Id);
        Assert.IsNull(delete.Data);
        Assert.IsEmpty(delete.Errors);

        update = await Catalogue.UpdateAsync(item.Id, item);
        Assert.IsNull(update.Data);
        Assert.IsEmpty(update.Errors);

    }

}