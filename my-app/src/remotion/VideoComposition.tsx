import { useEditorStore } from '../store/useEditorStore';

export const VideoComposition = () => {
  const { elements } = useEditorStore();
  


  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: '#000' }}>
      {/* Render all elements at current time */}
      {Array.from(elements.values()).map((el) => (
        <div
          key={el.id}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: el.boundingSize?.[0] ?? 200,
            height: el.boundingSize?.[1] ?? 60,
            transform: el.transform,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: 24,
            zIndex: el.zIndex ?? 1,
            overflow: 'visible',
          }}
        >
          {el.content}
        </div>
      ))}
    </div>
  );
};
