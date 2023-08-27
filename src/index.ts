import { cloneDeep, isObject } from "lodash";

export type Debuilder<T> = T extends IBuilder<infer B> ? B : 
    T extends IBuilder<infer B>[] ? B[] : T;

export type BuilderObject<T> = {
    [K in keyof T]: Debuilder<T[K]>
}

export type IBuilder<T> = {
    [K in keyof T]: T[K] extends Array<infer TItem> ? (item : TItem, ...values : TItem[]) => IBuilder<T> : (value : T[K]) => IBuilder<T>;
} & { 
    _asObject() : BuilderObject<T>;
}

export const isBuilder = (value : unknown) : value is IBuilder<unknown> =>
    isObject(value) && (value as any)._asObject;

const valueToObject = (value : any) : any => {
    if(Array.isArray(value)) {
        return value.map(valueToObject);
    }
    if(isBuilder(value)) {
        return value._asObject();
    }
    return value;
}

export interface BuilderFactory<T> extends Function {
    (): IBuilder<T>;
    Template(): T;
    CreateBuilder<B extends {}>(template : B): BuilderFactory<T & B>;
}

export function CreateBuilder<T extends {}>(template : T) : BuilderFactory<T> {
    const BuilderFactory : BuilderFactory<T> = function () {
        const built = BuilderFactory.Template();
        const _asObject = () => {
            const output : Partial<T> = {}

            for(const [key, value] of Object.entries(built)) {
                output[key as keyof T] = valueToObject(value);
            }

            return output as T;
        }
        const builder = new Proxy({}, {
            get(_, key) {
                if(key === "_asObject") return _asObject;

                return (...args : unknown[]) => {
                    if(Array.isArray((built as any)[key])) (built as any)[key].push(...args);
                    else (built as any)[key] = args[0];
                    return builder;
                }
            }
        }) as IBuilder<T>;

        return builder as IBuilder<T>;
    }

    BuilderFactory.Template = () => cloneDeep<T>(template);

    BuilderFactory.CreateBuilder =  <B extends {}>(nextTemplate : B) => CreateBuilder({...BuilderFactory.Template(), ...nextTemplate});

    return BuilderFactory as BuilderFactory<T>;
}