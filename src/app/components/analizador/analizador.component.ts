import { Component, OnInit } from '@angular/core';
//import { stringify } from 'querystring';

@Component({
  selector: 'app-analizador',
  templateUrl: './analizador.component.html',
  styleUrls: ['./analizador.component.css'],
})
export class AnalizadorComponent implements OnInit {
  /*--Variables para conversion--*/
  terminales: string = '';
  noTerminales: string = '';
  inicial: string = '';
  caja_texto: string = '';

  /*---Declara variables-- */
  inicio = '';
  list_NT: string[] = [];
  list_T: string[] = ['a', 'b', 'c', 'd', 'e'];

  diccionario: { [key: string]: string[][] } = {};

  /*---Variables para hacer calculos---*/
  primeros: { [key: string]: string[] } = {};
  siguientes: { [key: string]: string[] } = {};
  tabla_analisis: string[][] = [];

  /*---#########Hacer metodo que reciba por texto########---*/
  constructor() {}

  ngOnInit(): void {}

  correMetodos() {
    /*Metodo leer cajas*/
    /*Se leen las cajas*/
    this.convertir_datos_cajas();

    console.log(this.inicio);
    console.log('lista NT');
    console.log(this.list_NT);
    console.log('lista T');
    console.log(this.list_T);
    console.log(this.diccionario);

    /*Factorizacion*/
    /*Se factoriza la gramatica si existe*/
    this.factorizacion();

    /*Eliminar recursion izquierda*/
    /*Se elimina la recursion izquierda si existe*/
    this.eliminarRecursionIzquierda();

    /*Primeros*/
    /*Se sacan los primeros */
    for (let noTerminal of this.list_NT) {
      this.primeros[noTerminal] = this.sacarPrimeros(noTerminal, [])!;
    }

    /*Siguientes */
    /*Se sacan los siguientes*/
    this.sacarSiguientes('A', this.inicio);

    /*Tabla de analisis sintatico */
    this.sacar_tabla();
  }

  /*----------Metodos para factorizacion------------ */
  factorizacion() {
    console.log('Se hizo factorizacion');
  }

  /*----------Metodos para recursion izquierda------------ */
  eliminarRecursionIzquierda() {
    for (let noTerminal in this.diccionario) {
      /*Si tiene recursion izquierda entra en el if */
      if (this.tieneRecursionIzquierda(noTerminal)) {
        let listaA: string[][] = [];
        let listaB: string[][] = [];

        /*Se separan los an y bn*/
        for (let vector of this.diccionario[noTerminal]) {
          if (vector[0] === noTerminal) {
            listaA.unshift(vector.slice(1, vector.length));
          } else {
            listaB.unshift(vector);
          }
        }

        let noTerminalPrimo: string = noTerminal + '_P';

        /*Se modifica la gramatica */
        this.diccionario[noTerminal] = [];
        this.diccionario[noTerminalPrimo] = [];

        /*Se agrega a los no terminales el primo*/
        this.list_NT.unshift(noTerminalPrimo);

        /*Para el noTerminal */
        for (let v of listaB) {
          let vectorTmp: string[] = v.concat([noTerminalPrimo]);
          this.diccionario[noTerminal].unshift(vectorTmp);
        }
        /*Para el noTerminal primo*/
        for (let v of listaA) {
          let vectorTmp: string[] = v.concat([noTerminalPrimo]);
          this.diccionario[noTerminalPrimo].unshift(vectorTmp);
        }

        /*Se agrega el lambda al noterminal primo*/
        this.diccionario[noTerminalPrimo].unshift(['#']);
      }
    }
  }

  tieneRecursionIzquierda(noTerminal: string) {
    /*Analizar si el vector esta vacio */
    for (let vector of this.diccionario[noTerminal])
      if (vector[0] === noTerminal) {
        return true;
      }
    return false;
  }

  /*----------------Metodos para primero------------------*/

  sacarPrimeros(noTerminal: string, listaRecorridos: string[]) {
    /*Si la letra esta en recorridos la ignora */
    if (listaRecorridos.includes(noTerminal)) {
      return;
    }

    /*-----Hace procedimiento para saber los primeros de una letra----- */
    listaRecorridos.unshift(noTerminal);
    let listaPrimerosTmp: string[] = [];

    /*------Recorrer los vectores del no terminal del diccionario----------*/
    for (let vector of this.diccionario[noTerminal]) {
      /*Recorre uno de los vectores del diccionario */
      for (let letra of vector) {
        /*1-Si el primero es un terminal se agrega, se sale del ciclo */
        if (this.list_T.includes(letra)) {
          listaPrimerosTmp = this.unionListas(listaPrimerosTmp, [letra]);
          break;
        }
        /*2-Si el primero es un lambda se agrega, se sale del ciclo*/
        if (letra === '#') {
          listaPrimerosTmp.unshift(letra);
          break;
        }

        /*3-Si es un no terminal se juntan con los primeros del terminal*/
        /*Si tiene un lambda se sigue el ciclo, si no se termina el ciclo*/
        if (this.list_NT.includes(letra)) {
          let primerosRecursion: string[] = this.sacarPrimeros(
            letra,
            listaRecorridos
          )!;

          for (let primero of primerosRecursion) {
            if (primero != '#') {
              if (!listaPrimerosTmp.includes(primero)) {
                listaPrimerosTmp.unshift(primero);
              }
            }
          }

          if (!primerosRecursion.includes('#')) {
            break;
          }
        }
        /*#####Agregar regla si llega al final###############*/
        /*4-Si es el ultimo y el proceso sigue, se agrega un lambda */
      }
    }

    return listaPrimerosTmp;
  }

  unionListas(lista1: string[], lista2: string[]) {
    return lista1.concat(lista2.filter((item) => lista1.indexOf(item) < 0));
  }

  /*----------------Metodos para los siguientes------------------*/
  sacarSiguientes(noTerminal: string, inicio: string) {
    /*1-Se agregan listas vacias en los siguientes,se agrega $ al noTerminal inicial*/
    for (let noTerminal of this.list_NT) {
      this.siguientes[noTerminal] = [];
    }

    this.siguientes['S'] = ['$'];
    /*
    2-Se analizan los no terminales de la siguiente forma
    a-Si hay una produccion Z=>a...aXY, entonces los primeros(Y) que no sean epsilon se agregan a siguientes(X)
    b-Si hay una produccion Z=>a...aXY, se debe tener en cuenta el lambda
    c-Si hay una produccion Z=>aX, entonces los siguientes(Z) se agregan a siguientes(X)
    */

    /*Se analiza cada noTerminal(llaves) del diccionario*/
    for (let llave in this.diccionario) {
      /*Se analiza cada vector del la llave seleccionada*/
      for (let vector of this.diccionario[llave]) {
        /*Se analiza cada vector*/
        for (let i = 0; i < vector.length; i++) {
          let elemento: string = vector[i];

          /*Si existe un elemento siguiente y el elemento es un no terminal */
          if (i + 1 < vector.length && this.list_NT.includes(elemento)) {
            for (let j = i + 1; j < vector.length; j++) {
              let elemento_sig: string = vector[j];

              /*Si el elementos_siguiente es un terminal
              #####paso A-se agrega los primeros del elemento siguiente terminal*/
              if (this.list_T.includes(elemento_sig)) {
                /*####Une la lista*/
                this.siguientes[elemento] = this.unirListasSiguiente(
                  this.siguientes[elemento],
                  [elemento_sig]
                );
                break;
              } else if (this.list_NT.includes(elemento_sig)) {

              /*Si el elemnto_siguiente es un noTerminal*/
                /*Se copia la lista para evitar errores */
                let primeros_aux: string[] =
                  this.primeros[elemento_sig].slice();
                /*###pasoC1-agrega los primeros del siguiente elemento*/
                this.siguientes[elemento] = this.unirListasSiguiente(
                  this.siguientes[elemento],
                  primeros_aux
                );

                /*###pasoC2-si tiene un lambda, se agrega los siguientes de la llave*/

                if (primeros_aux.includes('#')) {
                  this.siguientes[elemento] = this.unirListasSiguiente(
                    this.siguientes[elemento],
                    this.siguientes[elemento_sig]
                  );
                }
                break;
              }
            }
          } else if (this.list_NT.includes(elemento)) {
          /*Si no existe un elemento siguiente y el elemento es un no terminal */
            /*##pasoB-si no existe elemento siguiente, se asignan los siguientes de la llave*/
            /*Si la llave es igual al elemento no se asgina nada */
            if (elemento != llave) {
              this.siguientes[elemento] = this.unirListasSiguiente(
                this.siguientes[elemento],
                this.siguientes[llave]
              );
            }
          }
        }
      }
    }
  }

  unirListasSiguiente(lista1: string[], lista2: string[]) {
    let listaN: string[] = lista2.slice();

    for (let item of lista1) {
      if (!listaN.includes(item) && !(item == '#')) {
        listaN.unshift(item);
      }
    }
    return listaN;
  }

  /*Tabla de analisis sintatico*/
  sacar_tabla() {
    /*Se rellena la matriz con '--' */
    for (let i = 0; i < this.list_NT.length; i++) {
      let lista_aux: string[] = [];
      for (let j = 0; j < this.list_T.length + 1; j++) {
        lista_aux.unshift('---');
      }
      this.tabla_analisis.unshift(lista_aux.slice());
    }

    /*Se buscan los caminos y se agregan */
    for (let noTerminal of this.list_NT) {
      for (let primero of this.primeros[noTerminal]) {
        let matriz_aux: string[][] = this.diccionario[noTerminal];
        console.log('-------');
        console.log(noTerminal);
        console.log(primero);
        let pos_no_terminal = this.list_NT.indexOf(noTerminal);
        let pos_primero = this.list_T.indexOf(primero);

        console.log(pos_no_terminal);
        console.log(pos_primero);

        if (primero != '#') {
          this.tabla_analisis[pos_no_terminal][pos_primero] =
            this.encuentraCamino(noTerminal, primero).toString();
        } else {
          for (let siguiente of this.siguientes[noTerminal]) {
            if (siguiente == '$') {
              this.tabla_analisis[pos_no_terminal][this.list_T.length] =
                'lambda';
            } else {
              let pos_siguiente = this.list_T.indexOf(siguiente);
              this.tabla_analisis[pos_no_terminal][pos_siguiente] = 'lambda';
            }
          }
        }
      }
    }

    /*Se organiza la tabla para mostrarla en la pagina */
    for (let i = 0; i < this.list_NT.length; i++) {
      this.tabla_analisis[i].unshift(this.list_NT[i]);
    }

    this.tabla_analisis.unshift(['---']);
    this.tabla_analisis[0] = this.tabla_analisis[0].concat(this.list_T);
    this.tabla_analisis[0].push('$');
  }

  /*Busca el camino para llegar a ese primero*/
  encuentraCamino(noTerminal: string, primero: string) {
    for (let listaPrincipal of this.diccionario[noTerminal]) {
      /*Se copia la lista */
      let cola: string[] = listaPrincipal.slice();
      let visitados: string[] = listaPrincipal.slice();
      visitados.unshift(noTerminal);

      while (cola.length > 0) {
        let dato: string = cola.shift()!;
        visitados.unshift(dato);

        if (dato == primero) {
          return listaPrincipal;
        }

        /*Si es un noterminal se agregan sus hijos */
        if (this.list_NT.includes(dato)) {
          for (let lista of this.diccionario[dato]) {
            for (let palabra of lista) {
              if (!visitados.includes(palabra)) {
                cola.unshift(palabra);
              }
            }
          }
        }
      }
    }
    return [];
  }

  /*Convertir datos */
  convertir_datos_cajas() {
    /*Se agregan los datos de las cajas a las listas*/
    this.list_T = this.terminales.split('');
    this.list_NT = this.noTerminales.split('');

    /*Se agrega el inicial */
    this.inicio = this.inicial;

    /*Se crea el diccionario*/
    for (let noTerminal of this.list_NT) {
      this.diccionario[noTerminal] = [];
    }

    /*Se vacia la tabla */
    this.tabla_analisis = [];

    /*Se rellena el diccionario */

    let lineas: string[] = this.caja_texto.split('\n');

    for (let linea of lineas) {
      let lineaGramatica: string[] = linea.split('=>');
      let noT: string = lineaGramatica[0].toString();
      let gramatica: string[] = lineaGramatica[1].split('');

      this.diccionario[noT].unshift(gramatica);
    }
  }
}
