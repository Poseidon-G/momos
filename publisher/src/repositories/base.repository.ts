import { Repository, DataSource, DeepPartial, ObjectLiteral } from 'typeorm';

export interface FilterOption {
    field: string;
    operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'in' | 'between';
    value: any;
}

export interface SortOption {
    field: string;
    order: 'ASC' | 'DESC';
}

export interface QueryOptions {
    skip?: number;
    limit?: number;
    sort?: SortOption[];
    filters?: FilterOption[];
    relations?: string[];
}


export class BaseRepository<T extends ObjectLiteral> {
    protected repository: Repository<T>;

    constructor(private dataSource: DataSource, private entity: new () => T) {
        this.repository = this.dataSource.getRepository(entity);
    }

    // Find all entities
    async findAll(): Promise<T[]> {
        return this.repository.find();
    }

    // Find one by ID
    async findById(id: number): Promise<T | null> {
        return this.repository.findOne({ where: { id } as any });
    }

    //Find one by a specific field
    async findOneByField(field: string, value: any): Promise<T | null> {
        return this.repository.findOne({ where: { [field]: value } as any });
    }

    // Create a new entity
    async create(data: DeepPartial<T>): Promise<T> {
        const entity = this.repository.create(data);
        return this.repository.save(entity);
    }

    async findWithOptions(options: QueryOptions = {}): Promise<[T[], number]> {
        const {
            skip = 0,
            limit = 10,
            sort = [],
            filters = [],
            relations = []
        } = options;

        const query = this.repository.createQueryBuilder('entity');

        // Add relations
        relations.forEach(relation => {
            query.leftJoinAndSelect(`entity.${relation}`, relation);
        });

        // Apply filters
        filters.forEach((filter, index) => {
            const paramKey = `param${index}`;
            switch (filter.operator) {
                case 'eq':
                    query.andWhere(`entity.${filter.field} = :${paramKey}`, { [paramKey]: filter.value });
                    break;
                case 'neq':
                    query.andWhere(`entity.${filter.field} != :${paramKey}`, { [paramKey]: filter.value });
                    break;
                case 'gt':
                    query.andWhere(`entity.${filter.field} > :${paramKey}`, { [paramKey]: filter.value });
                    break;
                case 'gte':
                    query.andWhere(`entity.${filter.field} >= :${paramKey}`, { [paramKey]: filter.value });
                    break;
                case 'lt':
                    query.andWhere(`entity.${filter.field} < :${paramKey}`, { [paramKey]: filter.value });
                    break;
                case 'lte':
                    query.andWhere(`entity.${filter.field} <= :${paramKey}`, { [paramKey]: filter.value });
                    break;
                case 'like':
                    query.andWhere(`entity.${filter.field} ILIKE :${paramKey}`, { [paramKey]: `%${filter.value}%` });
                    break;
                case 'in':
                    query.andWhere(`entity.${filter.field} IN (:...${paramKey})`, { [paramKey]: filter.value });
                    break;
                case 'between':
                    if (Array.isArray(filter.value) && filter.value.length === 2) {
                        query.andWhere(`entity.${filter.field} BETWEEN :${paramKey}0 AND :${paramKey}1`, {
                            [`${paramKey}0`]: filter.value[0],
                            [`${paramKey}1`]: filter.value[1]
                        });
                    }
                    break;
            }
        });

        // Apply sorting
        sort.forEach(({ field, order }) => {
            query.addOrderBy(`entity.${field}`, order);
        });

        // Apply pagination
        query.skip(skip).take(limit);

        // Execute query
        const [items, total] = await query.getManyAndCount();
        return [items, total];
    }

    // Update an existing entity
    async update(id: number, data: DeepPartial<T>): Promise<T | null> {
        const entity = await this.findById(id);
        if (!entity) return null;
        const updatedEntity = this.repository.merge(entity, data);
        return this.repository.save(updatedEntity);
    }

    // Delete an entity
    async delete(id: number): Promise<boolean> {
        const result = await this.repository.delete(id);
        return result.affected ? true : false;
    }
}
