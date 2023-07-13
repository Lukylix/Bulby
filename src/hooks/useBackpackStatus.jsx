import { useEffect, useMemo, useState } from "react";

function useBackpackStatus(services, group) {
  const [resolvedServices, setResolvedServices] = useState([]);
  const servicesFlat = useMemo(
    () =>
      services
        .map((s) => (s.type === "grouped-service" ? s.services : [s]))
        .flat(1)
        .sort((a, b) => a.weight - b.weight),
    [services]
  );
  const dockerServices = useMemo(() => servicesFlat.filter((service) => service.container), [servicesFlat]);
  const pingServices = useMemo(() => servicesFlat.filter((service) => service.ping), [servicesFlat]);

  useEffect(() => {
    // Fetch Docker status
    const fetchDockerStatus = async () => {
      const promises = dockerServices.map(async (service) => {
        const url = `/api/docker/status/${service.container}/${service.server || ""}`;
        try {
          const response = await fetch(url);
          const data = await response.json();

          const status = (() => {
            if (!data?.status) return "";

            if (data?.status?.includes("running")) {
              return data.health === "healthy" ? "docker.healthy" : data.status;
            }

            if (data.status === "not found" || data.status === "exited" || data?.status?.startsWith("partial")) {
              if (data.status === "not found") return "docker.not_found";
              if (data.status === "exited") return "docker.exited";
            }

            if (!data.status) return "ok";

            return data.status;
          })();

          return { status, error: null, type: "docker" };
        } catch (error) {
          return { status: "error", error, type: "docker" };
        }
      });

      const resolvedDockerServices = await Promise.all(promises);
      setResolvedServices((prevServices) => [...prevServices, ...resolvedDockerServices]);
    };

    // Fetch ping status
    const fetchPingStatus = async () => {
      const promises = pingServices.map(async (service) => {
        const url = `/api/ping?${new URLSearchParams({ group, service: service.name }).toString()}`;
        try {
          const response = await fetch(url);
          const data = await response.json();

          const statusLabel = response.ok && !data?.error && data?.status <= 403 ? "ok" : "error";

          return { data, status: statusLabel, error: null, type: "ping" };
        } catch (error) {
          return { data: null, status: "error", error, type: "ping" };
        }
      });

      const resolvedPingServices = await Promise.all(promises);
      setResolvedServices((prevServices) => [...prevServices, ...resolvedPingServices]);
    };

    fetchDockerStatus();
    fetchPingStatus();
  }, [dockerServices, pingServices, group]);

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

  return useMemo(() => (resolvedServices?.length === 0 ? undefined : areServicesOk), [resolvedServices, areServicesOk]);
}

export default useBackpackStatus;
