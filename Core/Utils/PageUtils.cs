namespace KolibSoft.Catalogue.Core.Utils;

public static class PageUtils
{

    public static Page<T> GetPage<T>(this IEnumerable<T> items, int pageIndex, int pageSize)
    {
        pageIndex = int.Max(0, pageIndex);
        pageSize = int.Max(1, pageSize);
        var itemsCount = items.Count();
        var pageCount = itemsCount / pageSize;
        if (itemsCount % pageSize > 0) pageCount += 1;
        items = items.Skip(pageIndex * pageSize).Take(pageSize);
        var result = new Page<T>
        {
            Items = items,
            PageIndex = pageIndex,
            PageCount = pageCount
        };
        return result;
    }

}