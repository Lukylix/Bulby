import classNames from "classnames";

import Item from "components/services/item";

const columnMap = [
  "grid-cols-1 md:grid-cols-1 lg:grid-cols-1",
  "grid-cols-1 md:grid-cols-1 lg:grid-cols-1",
  "grid-cols-1 md:grid-cols-2 lg:grid-cols-2",
  "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  "grid-cols-1 md:grid-cols-2 lg:grid-cols-5",
  "grid-cols-1 md:grid-cols-2 lg:grid-cols-6",
  "grid-cols-1 md:grid-cols-2 lg:grid-cols-7",
  "grid-cols-1 md:grid-cols-2 lg:grid-cols-8",
];

const subcolumnMap = [
  "grid-cols-1",
  "grid-cols-1",
  "grid-cols-1 @[11rem]:grid-cols-2",
  "grid-cols-1 @[9rem]:grid-cols-2 @[18rem]:grid-cols-3",
  "grid-cols-1 @[7rem]:grid-cols-2 @[14rem]:grid-cols-3 @[21rem]:grid-cols-4",
  "grid-cols-1 @[7rem]:grid-cols-2 @[14rem]:grid-cols-3 @[21rem]:grid-cols-4 @[28rem]:grid-cols-5",
  "grid-cols-1 @[7rem]:grid-cols-2 @[14rem]:grid-cols-3 @[21rem]:grid-cols-4 @[28rem]:grid-cols-5 @[35rem]:grid-cols-6",
  "grid-cols-1 @[7rem]:grid-cols-2 @[14rem]:grid-cols-3 @[21rem]:grid-cols-4 @[28rem]:grid-cols-5 @[35rem]:grid-cols-6 [42rem]:grid-cols-7",
  "grid-cols-1 @[7rem]:grid-cols-2 @[14rem]:grid-cols-3 @[21rem]:grid-cols-4 @[28rem]:grid-cols-5 @[35rem]:grid-cols-6 [42rem]:grid-cols-7 [49rem]:grid-cols-8",
];

export default function List({ group, services, layout, isGroup = false }) {
  let gridClassName = isGroup ? subcolumnMap[layout?.columns] : columnMap[layout?.columns];
  if (gridClassName) gridClassName = ` grid auto-rows-max ${gridClassName} gap-x-2`;
  if (!gridClassName) gridClassName = " flex flex-wrap gap-x-2";

  return (
    <ul
      className={classNames(
        layout?.style === "row" || layout?.style === "auto-row" ? gridClassName : "flex flex-col",
        isGroup ? undefined : "mt-3"
      )}
    >
      {services.map((service) =>
        service.type === "grouped-service" ? (
          <List
            key={service.name}
            group={group}
            services={service.services}
            layout={{ columns: parseInt(service.name, 10) || service.services.length, style: "row" }}
            isGroup
          />
        ) : (
          <Item key={service.container ?? service.app ?? service.name} service={service} group={group} />
        )
      )}
    </ul>
  );
}
