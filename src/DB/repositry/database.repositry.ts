
import { CreateOptions, HydratedDocument,ProjectionType, Model,  QueryOptions, RootFilterQuery, FlattenMaps, UpdateQuery, MongooseUpdateQueryOptions, UpdateWriteOpResult } from 'mongoose';

export class DatabaseRepositry<TDocument>{

    constructor(protected readonly model:Model<TDocument>){}

    async create(
        {
            data,
            options,
        }:{
            data:Partial<TDocument>[],
            options?:CreateOptions
        }
    ):Promise<HydratedDocument<TDocument>[] | undefined> {
        return await  this.model.create(data,options);
}


    async findOne({
    filter,
    select,
    options

}:{
    filter?: RootFilterQuery<TDocument>,
    select?: ProjectionType<TDocument> | null,
    options?: QueryOptions<TDocument> | null,

}):Promise<HydratedDocument<FlattenMaps<TDocument>>|HydratedDocument<TDocument> | null> {

    const doc = this.model.findOne(filter).select(select || " ");
    if(options?.lean){
        doc.lean(options.lean);
    }


    return await doc.exec();

}



    async updateOne({
    filter,
    update,
    options
}:{
    
       filter:RootFilterQuery<TDocument>,
          update: UpdateQuery<TDocument> ,
          options?:  MongooseUpdateQueryOptions<TDocument>| null
}):Promise<UpdateWriteOpResult>{
    
    return await this.model.updateOne(filter,update, options);
}








































}






