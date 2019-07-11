def make_composite(fn_template, scene, up_to):
  commands = []
  fn1 = fn_template % (scene, 1)
  for i in range(2, up_to + 1):
    fn2 = fn_template % (scene, i)
    fn_composite = fn_template % (scene + '_composite', i - 1)
    commands.append(f'composite {fn1} -compose Screen {fn2} {fn_composite}')
    fn1 = fn_composite
  return ' && '.join(commands)

print(make_composite(
  r'/Users/freedmand/Downloads/composites/world_map/%s_%d.png',
  'world_map',
  7))
