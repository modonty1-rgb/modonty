"use client";

import type { DataNode } from "rc-tree/lib/interface";
import Tree from "rc-tree";
import "rc-tree/assets/index.css";

interface CategoriesTreeClientProps {
  categories: Array<{
    id: string;
    name: string;
    parentId: string | null;
    parent?: { name: string } | null;
    _count?: { articles: number };
  }>;
}

function buildTreeData(categories: CategoriesTreeClientProps["categories"]): DataNode[] {
  const nodeMap = new Map<string, DataNode>();
  const roots: DataNode[] = [];

  categories.forEach((category) => {
    nodeMap.set(category.id, {
      key: category.id,
      title: category.name,
      children: [],
    });
  });

  categories.forEach((category) => {
    const node = nodeMap.get(category.id)!;
    if (category.parentId) {
      const parentNode = nodeMap.get(category.parentId);
      if (parentNode) {
        if (!parentNode.children) {
          parentNode.children = [];
        }
        parentNode.children.push(node);
      } else {
        roots.push(node);
      }
    } else {
      roots.push(node);
    }
  });

  return roots;
}

export function CategoriesTreeClient({ categories }: CategoriesTreeClientProps) {
  const treeData = buildTreeData(categories);

  return (
    <div className="max-h-[600px] overflow-auto rounded-md border bg-background p-3">
      <Tree
        treeData={treeData}
        defaultExpandAll
        selectable={false}
        showLine
      />
    </div>
  );
}

