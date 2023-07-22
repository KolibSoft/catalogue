namespace KolibSoft.Catalogue.Core.Abstractions;

public interface ICatalogueConnector<TItem, in TFilters>
{

    public bool Available { get; }

    public Task<Result<Page<TItem>?>> PageAsync(TFilters? filters = default);
    public Task<Result<TItem?>> GetAsync(Guid id);
    public Task<Result<Guid?>> InsertAsync(TItem item);
    public Task<Result<bool?>> UpdateAsync(Guid id, TItem item);
    public Task<Result<bool?>> DeleteAsync(Guid id);

}