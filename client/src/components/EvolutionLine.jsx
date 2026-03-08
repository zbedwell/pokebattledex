import { EvolutionNodeCard } from "./EvolutionNodeCard.jsx";
import { EvolutionConnector } from "./EvolutionConnector.jsx";

const sortByDepthAndOrder = (a, b) => a.depth - b.depth || a.display_order - b.display_order;

export const EvolutionLine = ({ data }) => {
  if (!data) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
        Evolution data unavailable
      </div>
    );
  }

  if (data.evolution_unavailable) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        Evolution data unavailable
      </div>
    );
  }

  const nodes = [...(data.nodes || [])].sort(sortByDepthAndOrder);
  const edges = data.edges || [];

  if (nodes.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
        Evolution data unavailable
      </div>
    );
  }

  const depthGroupsMap = new Map();
  for (const node of nodes) {
    const group = depthGroupsMap.get(node.depth) || [];
    group.push(node);
    depthGroupsMap.set(node.depth, group);
  }

  const depthLevels = [...depthGroupsMap.keys()].sort((a, b) => a - b);
  const depthGroups = depthLevels.map((depth) => ({
    depth,
    nodes: (depthGroupsMap.get(depth) || []).sort((a, b) => a.display_order - b.display_order),
  }));

  const nodeDepthMap = new Map(nodes.map((node) => [node.pokemon_id, node.depth]));
  const edgeColumns = new Map();

  for (const depth of depthLevels) {
    edgeColumns.set(depth, []);
  }

  for (const edge of edges) {
    const fromDepth = nodeDepthMap.get(edge.from_pokemon_id);
    const toDepth = nodeDepthMap.get(edge.to_pokemon_id);

    if (fromDepth === undefined || toDepth === undefined) {
      continue;
    }

    if (toDepth === fromDepth + 1) {
      const list = edgeColumns.get(fromDepth) || [];
      list.push(edge);
      edgeColumns.set(fromDepth, list);
    }
  }

  const singleNodeFamily = Boolean(data.no_evolutions) || (nodes.length === 1 && edges.length === 0);

  return (
    <div className="space-y-4">
      {singleNodeFamily && (
        <p className="text-sm font-semibold text-slate-600">No Evolutions</p>
      )}

      <div className="md:hidden">
        <div className="space-y-3">
          {depthGroups.map((group, groupIndex) => (
            <div key={`mobile-depth-${group.depth}`} className="space-y-2">
              {group.nodes.map((node, nodeIndex) => (
                <EvolutionNodeCard
                  key={`mobile-node-${node.pokemon_id}`}
                  node={node}
                  animationDelayMs={groupIndex * 90 + nodeIndex * 45}
                />
              ))}

              {groupIndex < depthGroups.length - 1 && (edgeColumns.get(group.depth) || []).length > 0 && (
                <div className="space-y-2 pt-1">
                  {(edgeColumns.get(group.depth) || []).map((edge) => (
                    <EvolutionConnector
                      key={`mobile-edge-${edge.from_pokemon_id}-${edge.to_pokemon_id}`}
                      edge={edge}
                      orientation="vertical"
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="hidden overflow-x-auto md:block">
        <div className="inline-flex min-w-full items-start gap-4 pb-1">
          {depthGroups.map((group, groupIndex) => (
            <div key={`desktop-depth-wrap-${group.depth}`} className="contents">
              <div className="flex min-w-[230px] flex-col gap-3">
                {group.nodes.map((node, nodeIndex) => (
                  <EvolutionNodeCard
                    key={`desktop-node-${node.pokemon_id}`}
                    node={node}
                    animationDelayMs={groupIndex * 80 + nodeIndex * 45}
                  />
                ))}
              </div>

              {groupIndex < depthGroups.length - 1 && (
                <div className="flex min-w-[220px] flex-col justify-center gap-2 py-2">
                  {(edgeColumns.get(group.depth) || []).length === 0 ? (
                    <EvolutionConnector edge={{ label: "Special evolution path" }} orientation="horizontal" />
                  ) : (
                    (edgeColumns.get(group.depth) || []).map((edge) => (
                      <EvolutionConnector
                        key={`desktop-edge-${edge.from_pokemon_id}-${edge.to_pokemon_id}`}
                        edge={edge}
                        orientation="horizontal"
                      />
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
