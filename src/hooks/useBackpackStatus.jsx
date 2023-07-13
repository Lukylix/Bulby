import useSWR from "swr";
import { useMemo } from "react";

function usePingStatus(service, group) {
  const { data, error } = useSWR(`/api/ping?${new URLSearchParams({ group, service }).toString()}`, {
    refreshInterval: 30000,
  });

  const statusLabel = useMemo(() => {
    if (error || data?.error || !data || data?.status > 403 || !data?.status) return "error";
    return "ok";
  }, [data, error]);

  return [data, error, statusLabel];
}

function useDockerStatus(service) {
  const { data, error } = useSWR(`/api/docker/status/${service.container}/${service.server || ""}`);
  const status = useMemo(() => {
    if (!data?.status) return "";

    if (data?.status?.includes("running")) {
      return data.health === "healthy" ? "docker.healthy" : data.health;
    }

    if (data.status === "not found" || data.status === "exited" || data?.status?.startsWith("partial")) {
      if (data.status === "not found") return "docker.not_found";
      if (data.status === "exited") return "docker.exited";
    }
    return data.status;
  }, [data]);

  return [status, error];
}

export default function useBackpackStatus(services, group) {
  const resolvedServices = [];
  const servicesFlat = services.map((s) => (s.type === "grouped-service" ? s.services : [s])).flat(1);
  const dockerServices = servicesFlat.filter((service) => service.container);
  const pingServices = servicesFlat.filter((service) => service.ping);
  for (let i = 0; i < dockerServices.length; i += 1) {
    const service = dockerServices[i];
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [status, error] = useDockerStatus(service);
    resolvedServices.push({ status, error, type: "docker" });
  }
  for (let i = 0; i < pingServices.length; i += 1) {
    const service = pingServices[i];
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [data, error, status] = usePingStatus(service.name, group);
    resolvedServices.push({ data, status, error, type: "ping" });
  }
  const areServicesOk = resolvedServices.reduce((acc, service) => {
    if (service.type === "docker") {
      if (service.error) return "error";
      if (service?.status?.includes("running") || service?.status === "healthy") {
        if (acc === undefined) return service.status;
      } else {
        return service.status;
      }
    } else if (service.type === "ping") {
      if (service.error) return "error";
      if (service.status === "ok" && acc === undefined) return service.status;
    }
    return acc;
  }, undefined);

  return resolvedServices.length === 0 ? undefined : areServicesOk;
}
