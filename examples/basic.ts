import { CreateBuilder, IBuilder } from "../";

type IParentObject = {
    name : string;
    comment: string;
    metadata: string[];
    children: IBuilder<IParentObject>[];
}

const ParentObject = CreateBuilder<IParentObject>({
    name: "",
    comment: "",
    metadata: [],
    children: []
});

const ChildObject = ParentObject.CreateBuilder({
    key: "value"
});

console.log(
    ParentObject()
    .comment("TestComment")
    .name("Test Object")
    .metadata("M1", "M2")
    .metadata("M3")
    .children(
        ParentObject().name("TestChild"),
        ChildObject().key("A")
    )
    ._asObject()
)