using static KolibSoft.Catalogue.Core.Constants;

namespace KolibSoft.Catalogue.Core.Abstractions;

public interface ICatalogueConnector<TItem, in TFilters>
{

    public bool Available { get; }

    public Task<Result<Page<TItem>?>> QueryAsync(TFilters? filters = default, int pageIndex = 0, int pageSize = DefaultChunkSize);
    public Task<Result<TItem?>> GetAsync(Guid id);
    public Task<Result<TItem?>> InsertAsync(TItem item);
    public Task<Result<TItem?>> UpdateAsync(Guid id, TItem item);
    public Task<Result<TItem?>> DeleteAsync(Guid id);

}