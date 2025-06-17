export function LinkList(props: {list: {label: string; to: string; desc: string}[]}) {
  return (
    <ul>
      {props.list.map((el, idx) => (
        <li key={idx}>
          <a href={el.to} target="_blank" rel="noopener">
            {el.label}
          </a>
          : {el.desc}
        </li>
      ))}
    </ul>
  );
}
