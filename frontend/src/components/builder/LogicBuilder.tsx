import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../store';
import { addWorkflow, updateWorkflow, removeWorkflow } from '../../store/slices/builderSlice';
import type { FormWorkflow, WorkflowGroup, WorkflowCondition, LogicOperator } from '../../store/slices/builderSlice';
import { Plus, Trash2, Copy, GitBranch, X, ChevronDown } from 'lucide-react';

export const LogicBuilder: React.FC = () => {
  const dispatch = useDispatch();
  const workflows = useSelector((state: RootState) => state.builder.workflows);
  const fields = useSelector((state: RootState) => state.builder.fields);

  const handleAddWorkflow = () => {
    const newWorkflow: FormWorkflow = {
      id: Math.random().toString(36).substring(7),
      action: 'show',
      targetFieldIds: [],
      rootGroup: {
        id: Math.random().toString(36).substring(7),
        type: 'group',
        match: 'all',
        conditions: []
      }
    };
    dispatch(addWorkflow(newWorkflow));
  };

  return (
    <div className="flex-1 bg-slate-50 overflow-y-auto p-12 text-slate-800 custom-scrollbar">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">Conditional Logic</h2>
            <p className="text-slate-500 font-medium">Build advanced rules to show or hide multiple fields based on user answers.</p>
          </div>
          <button 
            onClick={handleAddWorkflow}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-semibold shadow-[0_8px_20px_-6px_rgba(59,130,246,0.5)] transition-all hover:-translate-y-0.5"
          >
            <Plus size={18} /> New Workflow
          </button>
        </div>

        {workflows.length === 0 ? (
          <div className="text-center py-24 border-2 border-dashed border-slate-300 rounded-2xl bg-white shadow-sm">
            <GitBranch size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-bold text-slate-700 mb-2">No Workflows Yet</h3>
            <p className="text-slate-500 mb-6 max-w-sm mx-auto font-medium">Create your first conditional logic workflow to make your form dynamic and smart.</p>
            <button 
              onClick={handleAddWorkflow}
              className="px-6 py-3 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 rounded-xl font-bold transition-all shadow-sm flex items-center gap-2 mx-auto"
            >
              <Plus size={18} /> Start Building
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {workflows.map(workflow => (
              <WorkflowCard key={workflow.id} workflow={workflow} fields={fields} dispatch={dispatch} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const WorkflowCard: React.FC<{
  workflow: FormWorkflow;
  fields: any[];
  dispatch: any;
}> = ({ workflow, fields, dispatch }) => {
  
  const handleUpdate = (updates: Partial<FormWorkflow>) => {
    dispatch(updateWorkflow({ ...workflow, ...updates }));
  };

  const handleDuplicate = () => {
    dispatch(addWorkflow({ ...workflow, id: Math.random().toString(36).substring(7) }));
  };

  const handleRemove = () => {
    dispatch(removeWorkflow(workflow.id));
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm relative group transition-all hover:shadow-md hover:border-slate-300">
      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={handleDuplicate} className="p-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg transition-all shadow-sm" title="Duplicate">
          <Copy size={16} />
        </button>
        <button onClick={handleRemove} className="p-2 bg-white border border-red-200 hover:bg-red-50 text-red-500 rounded-lg transition-all shadow-sm" title="Delete">
          <Trash2 size={16} />
        </button>
      </div>

      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <span className="px-3 py-1 bg-indigo-50 text-indigo-600 font-mono text-sm font-bold rounded-lg border border-indigo-100 shadow-sm">IF</span>
          <span className="text-slate-500 text-sm font-semibold">the following conditions are met:</span>
        </div>
        
        <ConditionGroupNode 
          group={workflow.rootGroup} 
          workflow={workflow}
          fields={fields} 
          dispatch={dispatch} 
          isRoot 
        />
      </div>

      <div className="p-6 bg-slate-50/50 border-t border-slate-100 rounded-b-2xl">
        <div className="flex items-center gap-3 mb-4">
          <span className="px-3 py-1 bg-emerald-50 text-emerald-600 font-mono text-sm font-bold rounded-lg border border-emerald-100 shadow-sm">THEN</span>
          
          <select 
            value={workflow.action}
            onChange={(e) => handleUpdate({ action: e.target.value as 'show' | 'hide' })}
            className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 text-sm font-bold outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 shadow-sm transition-all"
          >
            <option value="show">Show</option>
            <option value="hide">Hide</option>
          </select>
          <span className="text-slate-500 text-sm font-semibold">these fields:</span>
        </div>

        <div className="pl-[68px]">
          <TargetFieldSelector 
            selectedIds={workflow.targetFieldIds}
            onChange={(ids) => handleUpdate({ targetFieldIds: ids })}
            fields={fields}
          />
        </div>
      </div>
    </div>
  );
};

const ConditionGroupNode: React.FC<{
  group: WorkflowGroup;
  workflow: FormWorkflow;
  fields: any[];
  dispatch: any;
  isRoot?: boolean;
}> = ({ group, workflow, fields, dispatch, isRoot }) => {
  
  const updateGroup = (updatedGroup: WorkflowGroup) => {
    const replaceInTree = (node: WorkflowGroup | WorkflowCondition): WorkflowGroup | WorkflowCondition => {
      if (node.id === group.id) return updatedGroup;
      if (node.type === 'group') {
        return { ...node, conditions: node.conditions.map(replaceInTree) };
      }
      return node;
    };
    const newRoot = replaceInTree(workflow.rootGroup) as WorkflowGroup;
    dispatch(updateWorkflow({ ...workflow, rootGroup: newRoot }));
  };

  const removeGroup = () => {
    const removeNode = (node: WorkflowGroup): WorkflowGroup => {
      return {
        ...node,
        conditions: node.conditions.filter(c => c.id !== group.id).map(c => c.type === 'group' ? removeNode(c) : c)
      };
    };
    dispatch(updateWorkflow({ ...workflow, rootGroup: removeNode(workflow.rootGroup) }));
  };

  const handleAddCondition = () => {
    updateGroup({
      ...group,
      conditions: [...group.conditions, {
        id: Math.random().toString(36).substring(7),
        type: 'condition',
        sourceFieldId: fields[0]?.id || '',
        operator: 'equals',
        value: ''
      }]
    });
  };

  const handleAddGroup = () => {
    updateGroup({
      ...group,
      conditions: [...group.conditions, {
        id: Math.random().toString(36).substring(7),
        type: 'group',
        match: 'all',
        conditions: []
      }]
    });
  };

  const updateCondition = (index: number, updates: Partial<WorkflowCondition>) => {
    const newConditions = [...group.conditions];
    newConditions[index] = { ...newConditions[index], ...updates } as WorkflowCondition;
    updateGroup({ ...group, conditions: newConditions });
  };

  const removeCondition = (index: number) => {
    const newConditions = [...group.conditions];
    newConditions.splice(index, 1);
    updateGroup({ ...group, conditions: newConditions });
  };

  return (
    <div className={`p-5 rounded-xl ${isRoot ? 'pl-[68px]' : 'bg-slate-50 border border-slate-200 ml-6 relative shadow-inner'}`}>
      {!isRoot && (
        <div className="absolute -left-[25px] top-5 w-[24px] h-[2px] bg-slate-200" />
      )}
      {!isRoot && (
        <div className="absolute -left-[25px] -top-5 w-[2px] h-[40px] bg-slate-200" />
      )}

      {group.conditions.length > 0 && (
        <div className="flex items-center gap-2 mb-5">
          <span className="text-sm font-bold text-slate-500">Match</span>
          <select 
            value={group.match}
            onChange={(e) => updateGroup({ ...group, match: e.target.value as 'all' | 'any' })}
            className="px-2 py-1 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 font-bold outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-sm"
          >
            <option value="all">ALL</option>
            <option value="any">ANY</option>
          </select>
          <span className="text-sm font-bold text-slate-500">of these rules:</span>
          
          {!isRoot && (
            <button onClick={removeGroup} className="ml-auto text-red-500 hover:text-red-600 text-xs font-bold flex items-center gap-1 bg-white border border-red-200 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors">
              <X size={14} /> Remove Group
            </button>
          )}
        </div>
      )}

      <div className="space-y-3 relative">
        {group.conditions.length > 1 && (
          <div className="absolute left-[15px] top-8 bottom-8 w-[2px] bg-slate-200" />
        )}

        {group.conditions.map((node, index) => (
          <div key={node.id} className="relative">
            {node.type === 'condition' ? (
              <div className="flex items-center gap-3">
                {group.conditions.length > 1 && (
                  <div className="w-[32px] h-[32px] flex items-center justify-center bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-400 shadow-sm z-10">
                    {index === 0 ? '•' : group.match.toUpperCase()}
                  </div>
                )}

                <div className="flex-1 flex gap-2 p-2 bg-white border border-slate-200 rounded-xl hover:border-slate-300 hover:shadow-sm transition-all group/cond">
                  <select 
                    value={node.sourceFieldId}
                    onChange={(e) => updateCondition(index, { sourceFieldId: e.target.value })}
                    className="flex-1 bg-transparent text-sm font-semibold text-slate-700 outline-none px-2"
                  >
                    <option value="" disabled>Select Field...</option>
                    {fields.map(f => <option key={f.id} value={f.id}>{f.label || 'Unnamed Field'}</option>)}
                  </select>
                  
                  <select 
                    value={node.operator}
                    onChange={(e) => updateCondition(index, { operator: e.target.value as LogicOperator })}
                    className="w-[140px] bg-slate-50 border border-slate-200 rounded-lg px-2 text-sm font-semibold text-slate-600 outline-none focus:border-indigo-500"
                  >
                    <option value="equals">Equals</option>
                    <option value="not_equals">Does not equal</option>
                    <option value="contains">Contains</option>
                    <option value="greater_than">Is greater than</option>
                    <option value="less_than">Is less than</option>
                  </select>

                  <input 
                    type="text" 
                    value={node.value}
                    onChange={(e) => updateCondition(index, { value: e.target.value })}
                    placeholder="Value..."
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 text-sm font-medium text-slate-800 outline-none focus:border-primary-500 focus:bg-white placeholder:text-slate-400 transition-all shadow-inner"
                  />

                  <button onClick={() => removeCondition(index)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <X size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex">
                {group.conditions.length > 1 && (
                  <div className="w-[32px] h-[32px] flex items-center justify-center bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-400 shadow-sm z-10 mr-3 mt-4">
                    {index === 0 ? '•' : group.match.toUpperCase()}
                  </div>
                )}
                <div className="flex-1">
                  <ConditionGroupNode 
                    group={node} 
                    workflow={workflow} 
                    fields={fields} 
                    dispatch={dispatch} 
                  />
                </div>
              </div>
            )}
          </div>
        ))}

        <div className={`flex gap-3 pt-3 ${group.conditions.length > 1 ? 'ml-[44px]' : ''}`}>
          <button onClick={handleAddCondition} className="px-4 py-2.5 bg-white hover:bg-indigo-50 border border-indigo-100 text-indigo-600 text-sm font-bold rounded-xl transition-all shadow-sm flex items-center gap-2">
            <Plus size={16} /> Add Condition
          </button>
          <button onClick={handleAddGroup} className="px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 border-dashed text-slate-600 text-sm font-bold rounded-xl transition-all shadow-sm flex items-center gap-2">
            <Plus size={16} /> Add Rule Group
          </button>
        </div>
      </div>
    </div>
  );
};

const TargetFieldSelector: React.FC<{
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  fields: any[];
}> = ({ selectedIds, onChange, fields }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const toggleField = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter(x => x !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  return (
    <div className="relative">
      <div 
        className="min-h-[48px] p-2 bg-white border border-slate-300 shadow-inner rounded-xl cursor-pointer flex flex-wrap gap-2 items-center hover:border-slate-400 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedIds.length === 0 && <span className="text-slate-400 text-sm font-medium ml-2">Click to select fields...</span>}
        {selectedIds.map(id => {
          const f = fields.find(x => x.id === id);
          if (!f) return null;
          return (
            <span key={id} className="px-3 py-1 bg-slate-100 border border-slate-200 text-slate-700 text-sm font-semibold rounded-lg flex items-center gap-2 shadow-sm">
              {f.label || 'Unnamed Field'}
              <button 
                onClick={(e) => { e.stopPropagation(); toggleField(id); }}
                className="hover:text-red-500 transition-colors"
              >
                <X size={14} />
              </button>
            </span>
          );
        })}
        <div className="ml-auto mr-3 text-slate-400">
          <ChevronDown size={18} />
        </div>
      </div>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-2xl z-20 max-h-72 overflow-y-auto custom-scrollbar p-2">
            {fields.map(f => (
              <label key={f.id} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors group">
                <input 
                  type="checkbox" 
                  checked={selectedIds.includes(f.id)}
                  onChange={() => toggleField(f.id)}
                  className="w-4 h-4 rounded border-slate-300 text-primary-500 focus:ring-primary-500"
                />
                <span className="text-sm text-slate-700 font-semibold group-hover:text-slate-900">{f.label || 'Unnamed Field'}</span>
                <span className="ml-auto text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">{f.type}</span>
              </label>
            ))}
            {fields.length === 0 && (
              <div className="p-6 text-center text-slate-500 text-sm font-medium">No fields available. Add fields to the canvas first.</div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
