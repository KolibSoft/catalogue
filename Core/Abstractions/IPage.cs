namespace KolibSoft.Catalogue.Core.Abstractions;

public interface IPage<out T>
{
    public IEnumerable<T> Items { get; }
    public int PageIndex { get; }
    public int PageCount { get; }
}