hs = {}
if obj.status ~= nil and obj.status.state ~= nil then
    if obj.status.state == "CREATED" and obj.status.connectorState == "RUNNING" then
        hs.status = "Healthy"
        hs.message = "Connector running"
        return hs
    end
    if obj.status.state == "ERROR" then
        hs.status = "Degraded"
        for i, condition in ipairs(obj.status.conditions) do
            hs.message = condition.message
        end
    return hs
    end
end
hs.status = "Progressing"
hs.message = "Waiting for Kafka Connector"
return hs