from app.models.base import PageMeta


def build_page_meta(total: int, page: int, size: int) -> PageMeta:
    total_pages = (total + size - 1) // size
    return PageMeta(
        currentPage=page,
        totalPages=total_pages,
        hasNextPage=page < total_pages,
        totalCount=total,
    )
