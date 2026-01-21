import React, { useState } from 'react';
import styles from './Tree.module.scss';
import { Button, ChevronDownSVG, ChevronUpSVG } from 'skb_uikit';

type TreeNode = {
  id: number;
  label: React.ReactNode;
  children: TreeNode[];
};

export type TreeProps = {
  data: TreeNode;
  isRoot?: boolean;
  isOpenDefault?: boolean;
};

export const Tree: React.FC<TreeProps> = ({ data, isRoot = true, isOpenDefault = false }) => {
  const [isOpen, setIsOpen] = useState(isOpenDefault);

  const isHasChildren = !!data.children?.length;

  return (
    <div className={styles.tree} style={{ paddingLeft: isRoot ? 0 : 40 }}>
      <div className={styles.node} style={{ paddingLeft: isHasChildren ? 0 : 32 }}>
        {isHasChildren && (
          <Button onClick={() => setIsOpen(!isOpen)} variant={'text'} className={styles.nodeToggle}>
            {isOpen ? <ChevronUpSVG /> : <ChevronDownSVG />}
          </Button>
        )}
        {data.label}
      </div>
      {isHasChildren && isOpen && (
        <div className={styles.children}>
          {data.children.map((child) => (
            <Tree key={child.id} data={child} isRoot={false} />
          ))}
        </div>
      )}
    </div>
  );
};
