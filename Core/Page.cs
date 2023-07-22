using KolibSoft.Catalogue.Core.Abstractions;

namespace KolibSoft.Catalogue.Core;

public class Page<T> : IPage<T>
{
    public IEnumerable<T> Items { get; init; } = Array.Empty<T>();
    public int PageIndex { get; init; } = 0;
    public int PageCount { get; init; } = 0;
}