using KolibSoft.Catalogue.Core.Abstractions;

namespace KolibSoft.Catalogue.Core.Utils;

public static class ItemUtils
{

    public static TItem Clone<TItem>(this TItem item)
        where TItem : class, IUpdatable<TItem>, new()
    {
        var clone = new TItem();
        clone.Update(item);
        return clone;
    }

}