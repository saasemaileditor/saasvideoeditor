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
            left: el.position[0],
            top: el.position[1],
            transform: `scale(${el.scale[0]})`,
            color: '#fff',
            fontSize: 24,
          }}
        >
          {el.content}
        </div>
      ))}
    </div>
  );
};
