import json
# category sets for canonical ingredients
MEAT={'chicken breast','chicken thighs','ground beef','beef steak','bacon','ham','pork chops','ground turkey','sausage','chorizo','chicken broth','beef broth','ground pork','prosciutto','turkey slices','pepperoni','ground chicken'}
FISH={'salmon','tuna','shrimp','cod','fish sauce','anchovies','canned tuna','smoked salmon','caesar dressing'}
DAIRY={'butter','milk','cheese','parmesan','mozzarella','feta','cream','sour cream','greek yogurt','yogurt','cream cheese','ricotta','cheddar','heavy cream','blue cheese','cottage cheese','chocolate chips','pesto','caesar dressing'}
EGG={'eggs','mayonnaise','caesar dressing'}
ANIMAL_OTHER={'honey'}
GLUTEN={'pasta','bread','flour','tortillas','soy sauce','spaghetti','breadcrumbs','couscous','pita','noodles','burger buns','pizza dough','oats','lasagna noodles','barley','naan','croutons','gnocchi','udon noodles','panko','bagel','baguette','bulgur','pasta shells','granola','enchilada sauce','caesar dressing','sausage'}
# oats flagged as gluten (cross-contamination) to be safe
NUTS={'peanut butter','peanuts','almonds','walnuts','cashews','pine nuts','almond milk','pecans','pesto'}
CARB={'pasta','bread','flour','tortillas','rice','potatoes','spaghetti','breadcrumbs','couscous','pita','noodles','burger buns','pizza dough','oats','sugar','honey','black beans','chickpeas','lentils','sweet potatoes','corn','quinoa','banana','maple syrup','lasagna noodles','barley','naan','rice noodles','gnocchi','udon noodles','kidney beans','panko','croutons','white beans','peas','carrots','maple syrup','brown sugar','corn tortillas','quinoa','arborio rice','bulgur','bagel','baguette','pasta shells','granola','chocolate chips','apples','butternut squash','sweet potatoes','pinto beans','hummus','enchilada sauce','croutons'}
STAPLES={'salt','black pepper','olive oil','vegetable oil','water','sugar','flour','garlic powder','paprika','chili flakes','cumin','dried oregano','baking powder','vinegar'}
R=[]
def r(name,meal,time,serv,ings,steps,hp=False,emoji='🍽️'):
    items=[]
    for s in ings.split(';'):
        s=s.strip()
        q,_,c=s.rpartition(' ~ ') if ' ~ ' in s else ('',None,s)
        items.append({'q':q,'n':c.strip()})
    R.append(dict(name=name,meal=meal,time=time,servings=serv,ing=items,steps=steps,hp=hp,emoji=emoji))
B,L,D,S='breakfast','lunch','dinner','snack'
exec(open('recipes_src.py').read())
out=[]
allnames=set()
for i,x in enumerate(R):
    ns={it['n'] for it in x['ing']}
    allnames|=ns
    meat=ns&MEAT;fish=ns&FISH;dairy=ns&DAIRY;egg=ns&EGG
    t=[]
    if not meat and not fish: t.append('vegetarian')
    if not meat and not fish and not dairy and not egg and not ns&ANIMAL_OTHER: t.append('vegan')
    if not meat: t.append('pescatarian')
    if not ns&GLUTEN: t.append('gluten-free')
    if not dairy: t.append('dairy-free')
    if not ns&NUTS: t.append('nut-free')
    if not ns&CARB: t.append('low-carb')
    if x['hp']: t.append('high-protein')
    x['diet']=t;x['id']=i;del x['hp']
    out.append(x)
open('recipes.js','w').write('const RECIPES='+json.dumps(out,separators=(',',':'))+';\nconst STAPLES='+json.dumps(sorted(STAPLES))+';\nconst INGREDIENTS='+json.dumps(sorted(allnames))+';\n')
print(len(out),'recipes',len(allnames),'ingredients')
import collections;print(collections.Counter(t for x in out for t in x['diet']));print(collections.Counter(x['meal'] for x in out))
print(sorted(allnames))
